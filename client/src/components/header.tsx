import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";
import { useAuth } from '@/components/auth/AuthenticatorWrapper';

export function Header() {
  const [location] = useLocation();
  const isAuthPage = location === "/auth";
  const { isAuthenticated, user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">Pantry Pal</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/discover" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Discover
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/ingredients" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  My Pantry
                </Link>
                <Link href="/meal-planner" className="transition-colors hover:text-foreground/80 text-foreground/60">
                  Meal Planner
                </Link>
              </>
            )}
            <Link href="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Pricing
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search bar can be added here if needed */}
          </div>
          <nav className="flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.attributes?.email || ''}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button>Login</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 