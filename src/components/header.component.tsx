import { useContext, useState } from "react"
import { Link } from "react-router-dom"
import {
  createStyles,
  Container,
  UnstyledButton,
  Group,
  Text,
  Menu,
  Tabs,
  rem,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  IconLogout,
  IconHeart,
  IconStar,
  IconMessage,
  IconSettings,
  IconPlayerPause,
  IconTrash,
  IconSwitchHorizontal,
  IconChevronDown,
} from "@tabler/icons-react"
import logo_sm from "../img/logo_mat2.png"
import IUser from "../types/user.type"
import { userContext } from "../common/userContext"

const useStyles = createStyles((theme) => ({

  header: {
    paddingTop: theme.spacing.sm,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? "transparent" : theme.colors.gray[2]
    }`,
    marginBottom: rem(120),
  },

  mainSection: {
    paddingBottom: theme.spacing.sm,
  },

  user: {
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    transition: "background-color 100ms ease",

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    },

    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },

  userActive: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
  },

  tabs: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  tabsList: {
    borderBottom: "0 !important",
  },

  tab: {
    fontWeight: 500,
    height: rem(38),
    backgroundColor: "transparent",

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[1],
    },

    "&[data-active]": {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      borderColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[2],
    },
  },
}))

const tabs = ["Search", "History"]

interface HeaderTabsProps {
  onHeaderLinkClick(index: number): void
  onLogout(): void
}

export function HeaderTabs(props: HeaderTabsProps) {
  const { onHeaderLinkClick, onLogout } = props
  const { classes, theme, cx } = useStyles()
  const [userMenuOpened, setUserMenuOpened] = useState(false)
  const user = useContext(userContext)

  const items = tabs.map((tab, index) => (
    <Tabs.Tab value={tab} key={tab} onClick={() => onHeaderLinkClick(index)}>
      {tab}
    </Tabs.Tab>
  ))

  return (
    <div className={classes.header}>
      <Container size="default" className={classes.mainSection}>
        <Group position="apart" spacing="xl">
          {/* Logo */}
          <div className="logo-sm-container">
            <Link to="/">
              <img src={logo_sm} alt="mgai" className="logo-sm" />
            </Link>
          </div>

          {/* Tabs */}
          <Tabs
            defaultValue="Search"
            variant="outline"
            classNames={{
              root: classes.tabs,
              tabsList: classes.tabsList,
              tab: classes.tab,
            }}
          >
            <Tabs.List>{items}</Tabs.List>
          </Tabs>

          {/* User Menu */}
          {user && (
            <Menu
              width={200}
              position="bottom-end"
              transitionProps={{ transition: "pop-top-right" }}
              onClose={() => setUserMenuOpened(false)}
              onOpen={() => setUserMenuOpened(true)}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton
                  className={cx(classes.user, {
                    [classes.userActive]: userMenuOpened,
                  })}
                >
                  <Group spacing={7}>
                    {user && (user.image ? <div></div> : <div></div>)}
                    <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                      {user.name ? user.name : "User"}
                    </Text>
                    <IconChevronDown size={rem(12)} stroke={1.5} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Link to='/account'>
                  <Menu.Item icon={<IconSettings size="0.9rem" stroke={1.5} />}>
                    Account settings
                  </Menu.Item>
                </Link>
                <Menu.Divider />
                <Menu.Item icon={<IconLogout size="0.9rem" stroke={1.5} />} onClick={onLogout}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Container>
    </div>
  )
}
