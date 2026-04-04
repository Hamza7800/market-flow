"use client";

import { authClient } from "@/server/better-auth/client";
import { Dropdown, Label } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";

import {
  ChevronsUpDown,
  Sparkles,
  BadgeCheck,
  CreditCard,
  Bell,
  LogOut,
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";

export function NavUser() {
  const qc = useQueryClient();
  const router = useRouter();
  const { data } = authClient.useSession();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, [data]);

  return (
    <Dropdown>
      {/* TRIGGER */}
      <Dropdown.Trigger
        className={"flex flex-row items-center rounded-lg border p-2"}
      >
        <div className="flex flex-1 flex-col items-start text-left">
          <span className="truncate text-sm font-medium">
            {data?.user.name}
          </span>
          <span className="text-default-500 truncate text-xs">
            {data?.user.email}
          </span>
        </div>

        <ChevronsUpDown size={16} />
      </Dropdown.Trigger>

      {/* CONTENT */}
      <Dropdown.Popover className="min-w-64">
        <Dropdown.Menu aria-label="User menu">
          <Dropdown.Item id="profile" textValue="profile" className="gap-2">
            <div className="flex items-center gap-2">
              {/* <Avatar src={user.avatar} name={user.name} size="sm" /> */}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{data?.user.name}</span>
                <span className="text-default-500 text-xs">
                  {data?.user.email}
                </span>
              </div>
            </div>
          </Dropdown.Item>

          <Dropdown.Item
            onClick={async () => {
              await authClient.signOut();
              qc.resetQueries();
              router.replace("/");
            }}
            id="logout"
            variant="danger"
          >
            <div className="flex items-center gap-2">
              <LogOut size={16} />
              <Label>Log out</Label>
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
