import { ActivityLog, ActivityType, DailyFocus, DailyRecovery, Deliverable, Targets, UserProfile, AchievementUnlock } from "./types"

export const DB_NAME = "tech-performance-os"
export const DB_VERSION = 1

export const STORES = {
  activityTypes: "activityTypes",
  activityLogs: "activityLogs",
  deliverables: "deliverables",
  dailyFocus: "dailyFocus",
  dailyRecovery: "dailyRecovery",
  profile: "profile",
  targets: "targets",
  achievementUnlocks: "achievementUnlocks",
} as const

export type StoreName = (typeof STORES)[keyof typeof STORES]

export type StoreRecordMap = {
  [STORES.activityTypes]: ActivityType
  [STORES.activityLogs]: ActivityLog
  [STORES.deliverables]: Deliverable
  [STORES.dailyFocus]: DailyFocus
  [STORES.dailyRecovery]: DailyRecovery
  [STORES.profile]: UserProfile
  [STORES.targets]: Targets
  [STORES.achievementUnlocks]: AchievementUnlock
}

const dbPromise: { current: Promise<IDBDatabase> | null } = { current: null }

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available"))
  }
  if (!dbPromise.current) {
    dbPromise.current = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORES.activityTypes)) {
          const store = db.createObjectStore(STORES.activityTypes, { keyPath: "id" })
          store.createIndex("domain", "domain", { unique: false })
        }
        if (!db.objectStoreNames.contains(STORES.activityLogs)) {
          const store = db.createObjectStore(STORES.activityLogs, { keyPath: "id" })
          store.createIndex("dateKey", "dateKey", { unique: false })
          store.createIndex("domain", "domain", { unique: false })
        }
        if (!db.objectStoreNames.contains(STORES.deliverables)) {
          const store = db.createObjectStore(STORES.deliverables, { keyPath: "id" })
          store.createIndex("dateKey", "dateKey", { unique: false })
        }
        if (!db.objectStoreNames.contains(STORES.dailyFocus)) {
          db.createObjectStore(STORES.dailyFocus, { keyPath: "dateKey" })
        }
        if (!db.objectStoreNames.contains(STORES.dailyRecovery)) {
          db.createObjectStore(STORES.dailyRecovery, { keyPath: "dateKey" })
        }
        if (!db.objectStoreNames.contains(STORES.profile)) {
          db.createObjectStore(STORES.profile, { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains(STORES.targets)) {
          db.createObjectStore(STORES.targets, { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains(STORES.achievementUnlocks)) {
          db.createObjectStore(STORES.achievementUnlocks, { keyPath: "id" })
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  return dbPromise.current
}

export async function getAll<T extends StoreName>(storeName: T): Promise<StoreRecordMap[T][]> {
  const db = await openDb()
  const tx = db.transaction(storeName, "readonly")
  const store = tx.objectStore(storeName)
  return promisifyRequest(store.getAll()) as Promise<StoreRecordMap[T][]>
}

export async function getByKey<T extends StoreName>(
  storeName: T,
  key: IDBValidKey,
): Promise<StoreRecordMap[T] | undefined> {
  const db = await openDb()
  const tx = db.transaction(storeName, "readonly")
  const store = tx.objectStore(storeName)
  return promisifyRequest(store.get(key)) as Promise<StoreRecordMap[T] | undefined>
}

export async function getAllFromIndex<T extends StoreName>(
  storeName: T,
  indexName: string,
  query: IDBValidKey | IDBKeyRange,
): Promise<StoreRecordMap[T][]> {
  const db = await openDb()
  const tx = db.transaction(storeName, "readonly")
  const store = tx.objectStore(storeName)
  const index = store.index(indexName)
  return promisifyRequest(index.getAll(query)) as Promise<StoreRecordMap[T][]>
}

export async function put<T extends StoreName>(
  storeName: T,
  value: StoreRecordMap[T],
): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(storeName, "readwrite")
  const store = tx.objectStore(storeName)
  store.put(value)
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function bulkPut<T extends StoreName>(
  storeName: T,
  values: StoreRecordMap[T][],
): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(storeName, "readwrite")
  const store = tx.objectStore(storeName)
  values.forEach((value) => store.put(value))
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function remove<T extends StoreName>(
  storeName: T,
  key: IDBValidKey,
): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(storeName, "readwrite")
  const store = tx.objectStore(storeName)
  store.delete(key)
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function clearStore<T extends StoreName>(storeName: T): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(storeName, "readwrite")
  const store = tx.objectStore(storeName)
  store.clear()
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

export async function count<T extends StoreName>(storeName: T): Promise<number> {
  const db = await openDb()
  const tx = db.transaction(storeName, "readonly")
  const store = tx.objectStore(storeName)
  const request = store.count()
  return promisifyRequest(request)
}
