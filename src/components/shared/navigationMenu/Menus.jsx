"use client";
import React, { Fragment, useEffect, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { menuList } from "@/utils/fackData/menuList";
import getIcon from "@/utils/getIcon";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";

const Menus = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubDropdown, setOpenSubDropdown] = useState(null);
  const [activeParent, setActiveParent] = useState("");
  const [activeChild, setActiveChild] = useState("");
  const [cid, setCid] = useState("");
  const [tid, setTid] = useState("");
  const pathName = usePathname();
  const { data: session } = useSession();
  let decoded;
  let userDetails = {
    role: "",
  };

  if (session?.user?.token) {
    decoded = jwtDecode(session?.user?.token);
    userDetails.role = decoded.role;
  }

  useEffect(() => {
    const storedCid = localStorage.getItem("c_id");
    const storedTid = localStorage.getItem("t_id");
    if (storedCid) setCid(storedCid);
    if (storedTid) setTid(storedTid);
  }, [pathName]);

  //   const filteredMenu = menuList.filter((menu) => {
  //     if (decoded.role === "super_admin") {
  //       if (menu.name === "Lms" && (!cid || !tid)) return false;
  //       return true;
  //     }
  //     const permissions = ["dashboards", "Lms"];
  //     if (!permissions.includes(menu.name)) return false;
  //     if (menu.name === "Lms" && (!cid || !tid)) return false;

  //     return true;
  //   });
  const filteredMenu = menuList.filter((menu) => {
    const permissionsAdmin = [""];
    if (userDetails.role === "super_admin") {
      return !permissionsAdmin.includes(menu.name);
    }
    const permissionsUser = ["dashboards", "Lms","preview"];
    return permissionsUser.includes(menu.name);
  });

  const handleMainMenu = (e, name) => {
    if (openDropdown === name) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(name);
    }
  };

  const handleDropdownMenu = (e, name) => {
    e.stopPropagation();
    if (openSubDropdown === name) {
      setOpenSubDropdown(null);
    } else {
      setOpenSubDropdown(name);
    }
  };

  useEffect(() => {
    if (pathName !== "/") {
      const x = pathName.split("/");
      setActiveParent(x[1]);
      setActiveChild(x[2]);
      setOpenDropdown(x[1]);
      setOpenSubDropdown(x[2]);
    } else {
      setActiveParent("dashboards");
      setOpenDropdown("dashboards");
    }
  }, [pathName]);

  return (
    <>
      {filteredMenu.map(({ dropdownMenu, id, name, path, icon }) => {
        const hasDropdown =
          Array.isArray(dropdownMenu) && dropdownMenu.length > 0;

        return (
          <li
            key={id}
            onClick={(e) =>
              hasDropdown && handleMainMenu(e, name.split(" ")[0])
            }
            className={`nxl-item ${hasDropdown ? "nxl-hasmenu" : ""} ${
              activeParent === name.split(" ")[0] ? "active nxl-trigger" : ""
            }`}
          >
            <Link
              href={
                 name === "Lms"
                  ? `/Lms?c_id=${cid}&t_id=${tid}`
                  : path
              }
              className="nxl-link text-capitalize"
            >
              <span className="nxl-micon">{getIcon(icon)}</span>
              <span className="nxl-mtext" style={{ paddingLeft: "2.5px" }}>
                {name}
              </span>
              {hasDropdown && (
                <span className="nxl-arrow fs-16">
                  <FiChevronRight />
                </span>
              )}
            </Link>

            {hasDropdown && (
              <ul
                className={`nxl-submenu ${
                  openDropdown === name.split(" ")[0]
                    ? "nxl-menu-visible"
                    : "nxl-menu-hidden"
                }`}
              >
                {dropdownMenu.map(
                  ({ id, name, path, subdropdownMenu = [], target }) => {
                    const x = name;
                    return (
                      <Fragment key={id}>
                        {subdropdownMenu.length ? (
                          <li
                            className={`nxl-item nxl-hasmenu ${
                              activeChild === name ? "active" : ""
                            }`}
                            onClick={(e) => handleDropdownMenu(e, x)}
                          >
                            <Link
                              href={path}
                              className="nxl-link text-capitalize"
                            >
                              <span className="nxl-mtext">{name}</span>
                              <span className="nxl-arrow">
                                <FiChevronRight />
                              </span>
                            </Link>
                            {subdropdownMenu.map(({ id, name, path }) => (
                              <ul
                                key={id}
                                className={`nxl-submenu ${
                                  openSubDropdown === x
                                    ? "nxl-menu-visible"
                                    : "nxl-menu-hidden"
                                }`}
                              >
                                <li
                                  className={`nxl-item ${
                                    pathName === path ? "active" : ""
                                  }`}
                                >
                                  <Link
                                    className="nxl-link text-capitalize"
                                    href={path}
                                  >
                                    {name}
                                  </Link>
                                </li>
                              </ul>
                            ))}
                          </li>
                        ) : (
                          <li
                            className={`nxl-item ${
                              pathName === path ? "active" : ""
                            }`}
                          >
                            <Link
                              className="nxl-link"
                              href={path}
                              target={target}
                            >
                              {name}
                            </Link>
                          </li>
                        )}
                      </Fragment>
                    );
                  }
                )}
              </ul>
            )}
          </li>
        );
      })}
    </>
  );
};

export default Menus;
