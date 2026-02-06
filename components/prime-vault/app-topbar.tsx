"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BrandLogo } from "./brand-logo"

interface AppTopbarProps {
  title: string
  onToggleSidebar: () => void
  sidebarCollapsed: boolean
}

export function AppTopbar({ title, onToggleSidebar }: AppTopbarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="size-9 lg:hidden"
        >
          <Menu className="size-5" />
        </Button>

        {/* Mobile brand */}
        <div className="lg:hidden">
          <BrandLogo variant="full" size="md" />
        </div>

        {/* Section Title */}
        <h1 className="hidden text-lg font-semibold tracking-tight text-foreground lg:block">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="size-9 text-muted-foreground transition-colors hover:text-foreground"
        >
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>

        {/* User Avatar Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 overflow-hidden rounded-full"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-muted">
                <User className="size-3.5 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
