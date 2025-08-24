"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        if (error) console.error("Error fetching user role:", error);
        else setUserRole(userData ? userData.role : null);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          const fetchRoleOnChange = async () => {
            const { data: userData, error } = await supabase
              .from("users")
              .select("role")
              .eq("id", session.user.id)
              .single();
            if (error) console.error("Error fetching user role:", error);
            else setUserRole(userData ? userData.role : null);
          };
          fetchRoleOnChange();
        } else {
          setUserRole(null);
        }
      }
    );

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error);
    else {
      setUser(null);
      setUserRole(null);
      router.push("/login");
    }
  };

  return (
    <nav className="bg-gray-800 p-4 text-white fixed w-full z-10 top-0">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Warranty System
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link href="/warranty-check" className="hover:text-gray-300">
              Warranty Check
            </Link>
          </li>
          {!user && (
            <li>
              <Link href="/login" className="hover:text-gray-300">
                Login
              </Link>
            </li>
          )}
          {user && userRole === "company" && (
            <li>
              <Link href="/dashboard/company" className="hover:text-gray-300">
                Company Dashboard
              </Link>
            </li>
          )}
          {user && userRole === "distributor" && (
            <li>
              <Link
                href="/dashboard/distributor"
                className="hover:text-gray-300"
              >
                Distributor Dashboard
              </Link>
            </li>
          )}
          {user && (
            <li>
              <button onClick={handleLogout} className="hover:text-gray-300">
                Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
