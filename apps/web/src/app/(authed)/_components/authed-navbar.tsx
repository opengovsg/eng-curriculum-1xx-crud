'use client'

import {
  Avatar,
  Button,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  SubmenuTrigger,
} from '@opengovsg/oui'
import { BiChevronDown, BiCog, BiLogOut } from 'react-icons/bi'

import { useAuth } from '~/lib/auth'

export const AuthedNavbar = () => {
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  return (
    <Navbar>
      <NavbarContent justify="start">
        <NavbarBrand>
          <p className="font-bold text-inherit">Starter Kit</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <MenuTrigger>
            <Button
              variant="clear"
              size="md"
              endContent={<BiChevronDown className="h-5 w-5" />}
            >
              <Avatar
                size="xs"
                name={user.email}
                getInitials={(name) => name.slice(0, 1).toUpperCase()}
              >
                <Avatar.Fallback />
              </Avatar>
            </Button>
            <Menu>
              <MenuSection title={user.email}>
                <SubmenuTrigger>
                  <MenuItem startContent={<BiCog />}>Settings</MenuItem>
                  <Menu>
                    <MenuItem
                      href="/settings/app-config"
                      startContent={<BiCog />}
                      id="open"
                    >
                      App Config
                    </MenuItem>
                  </Menu>
                </SubmenuTrigger>
                <MenuItem startContent={<BiLogOut />} onPress={() => logout()}>
                  Logout
                </MenuItem>
              </MenuSection>
            </Menu>
          </MenuTrigger>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  )
}
