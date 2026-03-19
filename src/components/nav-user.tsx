"use client";

import { Dropdown, Label } from "@heroui/react";

import {
  ChevronsUpDown,
  Sparkles,
  BadgeCheck,
  CreditCard,
  Bell,
  LogOut,
} from "lucide-react";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  return (
    <Dropdown>
      {/* TRIGGER */}
      <Dropdown.Trigger
        className={"flex flex-row items-center rounded-lg border p-2"}
      >
        <div className="flex flex-1 flex-col items-start text-left">
          <span className="truncate text-sm font-medium">{user.name}</span>
          <span className="text-default-500 truncate text-xs">
            {user.email}
          </span>
        </div>

        <ChevronsUpDown size={16} />
      </Dropdown.Trigger>

      {/* CONTENT */}
      <Dropdown.Popover className="min-w-64">
        <Dropdown.Menu
          aria-label="User menu"
          onAction={(key) => console.log(key)}
        >
          {/* USER INFO */}
          <Dropdown.Item id="profile" textValue="profile" className="gap-2">
            <div className="flex items-center gap-2">
              {/* <Avatar src={user.avatar} name={user.name} size="sm" /> */}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-default-500 text-xs">{user.email}</span>
              </div>
            </div>
          </Dropdown.Item>

          <Dropdown.Section>
            <Dropdown.Item id="upgrade">
              <div className="flex items-center gap-2">
                <Sparkles size={16} />
                <Label>Upgrade to Pro</Label>
              </div>
            </Dropdown.Item>
          </Dropdown.Section>

          <Dropdown.Section>
            <Dropdown.Item id="account">
              <div className="flex items-center gap-2">
                <BadgeCheck size={16} />
                <Label>Account</Label>
              </div>
            </Dropdown.Item>

            <Dropdown.Item id="billing">
              <div className="flex items-center gap-2">
                <CreditCard size={16} />
                <Label>Billing</Label>
              </div>
            </Dropdown.Item>

            <Dropdown.Item id="notifications">
              <div className="flex items-center gap-2">
                <Bell size={16} />
                <Label>Notifications</Label>
              </div>
            </Dropdown.Item>
          </Dropdown.Section>

          <Dropdown.Item id="logout" variant="danger">
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
