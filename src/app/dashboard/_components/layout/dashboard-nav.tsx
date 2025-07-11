"use client";

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { CreditCard, Home, PiggyBank, TrendingUp, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { cn } from "~/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Debts", href: "/dashboard/debts", icon: CreditCard },
  { name: "Payments", href: "/dashboard/payments", icon: PiggyBank },
  { name: "Strategies", href: "/dashboard/strategies", icon: TrendingUp },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

interface DashboardNavProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function DashboardNav({
  sidebarOpen,
  setSidebarOpen,
}: DashboardNavProps) {
  const pathname = usePathname();

  const NavContent = () => (
    <div className="bg-background flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-primary text-xl font-bold">Debt Manager</h1>
      </div>
      <nav className="flex flex-1 flex-col" aria-label="Main navigation">
        <ul className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "border-l-primary/50 bg-primary text-primary-foreground border-l-4 shadow-sm"
                        : "text-foreground hover:border-l-primary/20 hover:bg-accent hover:text-accent-foreground hover:border-l-4 hover:shadow-sm",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200",
                    )}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={pathname === item.href ? "page" : undefined}
                  >
                    <item.icon
                      className={cn(
                        pathname === item.href
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-primary transition-colors",
                        "h-6 w-6 shrink-0",
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <TransitionChild
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" />
          </TransitionChild>

          <div className="fixed inset-0 flex">
            <TransitionChild
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
                <TransitionChild
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 left-full flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                      aria-label="Close sidebar"
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </TransitionChild>
                <NavContent />
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="border-border border-r">
          <NavContent />
        </div>
      </div>
    </>
  );
}
