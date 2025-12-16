"use client";

import { BellIcon, ChevronDownIcon, HelpCircleIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import * as React from "react";
import { useEffect, useMemo, useRef } from "react";
import { PasswordForm } from "@/components/shared/PasswordForm";
import { ProfileForm } from "@/components/shared/ProfileForm";
import { SigninForm } from "@/components/shared/SigninForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import logo from "@/public/logo.png";

const ThemeToggler = dynamic(
  () => import("@/components/shared/ThemeToggler").then((module) => module.ThemeToggler),
  { ssr: false },
);

// Simple logo component for the navbar
const Logo = () => {
  return <Image src={logo} alt="Logo" width={0} height={0} className="size-8" />;
};

// Hamburger icon component
const HamburgerIcon = ({ className, ...props }: React.SVGAttributes<SVGElement>) => (
  <svg
    className={cn("pointer-events-none", className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M4 12L20 12"
      className="-translate-y-[7px] origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-315"
    />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
    />
    <path
      d="M4 12H20"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"
    />
  </svg>
);

// Info Menu Component
const InfoMenu = ({ onItemClick }: { onItemClick?: (item: string) => void }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <HelpCircleIcon className="h-4 w-4" />
        <span className="sr-only">Help and Information</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.("help")}>Help Center</DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.("documentation")}>
        Documentation
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.("contact")}>Contact Support</DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.("feedback")}>Send Feedback</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Notification Menu Component
const NotificationMenu = ({
  notificationCount = 3,
  onItemClick,
}: {
  notificationCount?: number;
  onItemClick?: (item: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="relative h-9 w-9">
        <BellIcon className="h-4 w-4" />
        {notificationCount > 0 && (
          <Badge className="-top-1 -right-1 absolute flex h-5 w-5 items-center justify-center p-0 text-xs">
            {notificationCount > 9 ? "9+" : notificationCount}
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-80">
      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.("notification1")}>
        <div className="flex flex-col gap-1">
          <p className="font-medium text-sm">New message received</p>
          <p className="text-muted-foreground text-xs">2 minutes ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.("notification2")}>
        <div className="flex flex-col gap-1">
          <p className="font-medium text-sm">System update available</p>
          <p className="text-muted-foreground text-xs">1 hour ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onItemClick?.("notification3")}>
        <div className="flex flex-col gap-1">
          <p className="font-medium text-sm">Weekly report ready</p>
          <p className="text-muted-foreground text-xs">3 hours ago</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onItemClick?.("view-all")}>
        View all notifications
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// User Menu Component
const UserMenu = ({
  session,
  userAvatar,
}: {
  session: Session;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}) => {
  const pathname = usePathname();
  const [dialog, setDialog] = React.useState<{ [key: string]: boolean }>({ password: false });
  const user = useMemo(() => {
    if (!session) return null;
    return session.user;
  }, [session]);
  const onItemClick = (item: string) => {
    setDialog({ ...dialog, [item]: true });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 px-2 py-0 hover:bg-accent hover:text-accent-foreground"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={user?.image ?? ""} alt={user?.name || ""} />
            <AvatarFallback className="text-xs">
              {(user?.name ?? "")
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <ChevronDownIcon className="ml-1 h-3 w-3" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">{user?.name ?? ""}</p>
            <p className="text-muted-foreground text-xs leading-none">{user?.email ?? ""}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onItemClick("profile")}>프로필 변경</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onItemClick("password")}>비밀번호 변경</DropdownMenuItem>
        {/* <DropdownMenuItem onClick={() => onItemClick("billing")}>Billing</DropdownMenuItem> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            signOut({ redirectTo: pathname });
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>

      <Dialog
        open={dialog.password}
        onOpenChange={(open) => setDialog({ ...dialog, password: open })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
            <DialogDescription>변경에 성공하면 자동 로그아웃됩니다.</DialogDescription>
          </DialogHeader>

          <PasswordForm
            email={user?.email!}
            // onSubmit={() => setDialog({ ...dialog, password: false })}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialog.profile}
        onOpenChange={(open) => setDialog({ ...dialog, profile: open })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>프로필 변경</DialogTitle>
          </DialogHeader>

          <ProfileForm user={user!} />
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
};

// Types
export interface NavbarNavItem {
  href?: string;
  label: string;
}

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  title?: string;
  logoHref?: string;
  navigationLinks?: NavbarNavItem[];
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
  onNavItemClick?: (href: string) => void;
  onInfoItemClick?: (item: string) => void;
  onNotificationItemClick?: (item: string) => void;
}

// Default navigation links
const defaultNavigationLinks: NavbarNavItem[] = [
  { href: "#", label: "Home" },
  { href: "#", label: "Features" },
  { href: "#", label: "Pricing" },
  { href: "#", label: "About" },
];

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      className,
      logo = <Logo />,
      title = "Travel Story",
      //   logoHref = "#",
      navigationLinks = defaultNavigationLinks,
      // userName = "John Doe",
      // userEmail = "john@example.com",
      userAvatar,
      notificationCount = 3,
      onNavItemClick,
      onInfoItemClick,
      onNotificationItemClick,
      ...props
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLElement>(null);
    const { status, data: session } = useSession();
    const hasSavedRef = useRef(false);
    const router = useRouter();

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const autosave = async () => {
      const histories = localStorage.getItem("histories");
      if (histories) {
        const res = await fetch("/api/histories/autosave", {
          method: "POST",
          body: histories,
        });

        if (res.ok) localStorage.removeItem("histories");
      }
    };

    useEffect(() => {
      if (status !== "authenticated" || hasSavedRef.current) return;
      hasSavedRef.current = true;
      autosave();
    }, [status]);

    return (
      <header
        ref={combinedRef}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 px-4 backdrop-blur **:no-underline supports-backdrop-filter:bg-background/60 md:px-6",
          className,
        )}
        {...props}
      >
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2">
            {/* Main nav */}
            <div className="flex items-center gap-6">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/");
                }}
                className="flex cursor-pointer items-center space-x-2 text-primary transition-colors hover:text-primary/90"
              >
                <div className="text-2xl">{logo}</div>
                <span className="inline-block font-bold text-xl">{title}</span>
              </button>
            </div>
          </div>
          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Theme toggler */}
              <ThemeToggler />
              {/* Info menu */}
              {/* <InfoMenu onItemClick={onInfoItemClick} /> */}
              {/* Notification */}
              <NotificationMenu
                notificationCount={notificationCount}
                onItemClick={onNotificationItemClick}
              />
            </div>
            {/* User menu */}
            {status === "authenticated" ? (
              <UserMenu session={session} userAvatar={userAvatar} />
            ) : (
              <SigninForm isDialog />
            )}
          </div>
        </div>
      </header>
    );
  },
);

Navbar.displayName = "Navbar";

export { Logo, HamburgerIcon, InfoMenu, NotificationMenu, UserMenu };
