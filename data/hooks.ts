"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AchievementsSummary,
  ActivityType,
  DaySummary,
  HistoryMonthData,
  RangeSummary,
  StatsSummary,
  Targets,
  UserProfile,
  WeekSummary,
  DailyFocus,
  DailyRecovery,
  Deliverable,
  ExportBundle,
} from "./types"
import { getDataProvider } from "./provider"

const provider = getDataProvider()

export const useActivityTypes = () =>
  useQuery<ActivityType[]>({
    queryKey: ["activity-types"],
    queryFn: () => provider.getActivityTypes(),
  })

export const useTargets = () =>
  useQuery<Targets>({
    queryKey: ["targets"],
    queryFn: () => provider.getTargets(),
  })

export const useProfile = () =>
  useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: () => provider.getProfile(),
  })

export const useTodaySummary = (dateKey: string) =>
  useQuery<DaySummary>({
    queryKey: ["today-summary", dateKey],
    queryFn: () => provider.getTodaySummary(dateKey),
  })

export const useWeekSummary = (weekStartKey: string) =>
  useQuery<WeekSummary>({
    queryKey: ["week-summary", weekStartKey],
    queryFn: () => provider.getWeekSummary(weekStartKey),
  })

export const useHistoryMonth = (year: number, month: number) =>
  useQuery<HistoryMonthData>({
    queryKey: ["history-month", year, month],
    queryFn: () => provider.getHistoryMonth(year, month),
  })

export const useRangeSummary = (startKey: string, endKey: string) =>
  useQuery<RangeSummary>({
    queryKey: ["range-summary", startKey, endKey],
    queryFn: () => provider.getRangeSummary(startKey, endKey),
    enabled: Boolean(startKey && endKey),
  })

export const useAchievementsSummary = () =>
  useQuery<AchievementsSummary>({
    queryKey: ["achievements"],
    queryFn: () => provider.getAchievementsSummary(),
  })

export const useStatsSummary = () =>
  useQuery<StatsSummary>({
    queryKey: ["stats"],
    queryFn: () => provider.getStatsSummary(),
  })

const useInvalidateData = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ["today-summary"] })
    queryClient.invalidateQueries({ queryKey: ["week-summary"] })
    queryClient.invalidateQueries({ queryKey: ["history-month"] })
    queryClient.invalidateQueries({ queryKey: ["range-summary"] })
    queryClient.invalidateQueries({ queryKey: ["achievements"] })
    queryClient.invalidateQueries({ queryKey: ["stats"] })
    queryClient.invalidateQueries({ queryKey: ["profile"] })
    queryClient.invalidateQueries({ queryKey: ["targets"] })
    queryClient.invalidateQueries({ queryKey: ["activity-types"] })
  }
}

export const useAddActivityLog = () => {
  const invalidate = useInvalidateData()
  return useMutation({
    mutationFn: (input: { dateKey: string; typeId: string; minutes: number; note?: string }) =>
      provider.addActivityLog(input),
    onSuccess: invalidate,
  })
}

export const useUpsertDailyFocus = () => {
  const invalidate = useInvalidateData()
  return useMutation({
    mutationFn: (input: Omit<DailyFocus, "updatedAt">) => provider.upsertDailyFocus(input),
    onSuccess: invalidate,
  })
}

export const useUpsertDailyRecovery = () => {
  const invalidate = useInvalidateData()
  return useMutation({
    mutationFn: (input: Omit<DailyRecovery, "updatedAt">) => provider.upsertDailyRecovery(input),
    onSuccess: invalidate,
  })
}

export const useAddDeliverable = () => {
  const invalidate = useInvalidateData()
  return useMutation({
    mutationFn: (input: Omit<Deliverable, "id" | "createdAt" | "isDone">) =>
      provider.addDeliverable(input),
    onSuccess: invalidate,
  })
}

export const useToggleDeliverableDone = () => {
  const invalidate = useInvalidateData()
  return useMutation({
    mutationFn: (input: { id: string; done: boolean }) =>
      provider.toggleDeliverableDone(input.id, input.done),
    onSuccess: invalidate,
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<UserProfile>) => provider.updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      queryClient.invalidateQueries({ queryKey: ["stats"] })
    },
  })
}

export const useUpdateTargets = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Targets>) => provider.updateTargets(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["targets"] })
      queryClient.invalidateQueries({ queryKey: ["today-summary"] })
      queryClient.invalidateQueries({ queryKey: ["week-summary"] })
      queryClient.invalidateQueries({ queryKey: ["history-month"] })
      queryClient.invalidateQueries({ queryKey: ["range-summary"] })
    },
  })
}

export const useExportData = () =>
  useMutation<ExportBundle>({ mutationFn: () => provider.exportData() })

export const useImportData = () => {
  const invalidate = useInvalidateData()
  return useMutation({
    mutationFn: (bundle: ExportBundle) => provider.importData(bundle),
    onSuccess: invalidate,
  })
}
