import { Fragment, useContext } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import AuthContext from "../AuthContext";
import { Link } from "react-router-dom";

import {
  MdDashboard,
  MdOutlineInventory2,
  MdBarChart,
  MdAssignmentReturn,
  MdAssessment,
  MdSettings,
} from "react-icons/md";

const navigation = [
  { name: "نظارت عمومی", to: "/", icon: MdDashboard },
  { name: "مدیریت اجناس", to: "/inventory", icon: MdOutlineInventory2 },
  { name: "توزیع اجناس", to: "/sales", icon: MdBarChart },
  { name: "اجناس اعاده", to: "/purchase-details", icon: MdAssignmentReturn },
  { name: "گزارشات", to: "/reports", icon: MdAssessment },
  { name: "تنظیمات", to: "/manage-store", icon: MdSettings },
];

const userNavigation = [{ name: "Sign out", href: "./login" }];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const authContext = useContext(AuthContext);
  const localStorageData = JSON.parse(localStorage.getItem("user"));
  return (
    <>
      <div className="min-h-full">
        <Disclosure
          as="nav"
          className="bg-gradient-to-r from-blue-700 to-blue-500"
        >
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center p-3 rounded-xl ">
                    <div className="flex items-center gap-3">
                      <img
                        className="h-10 w-10 rounded-full border border-white shadow-md"
                        src={require("../assets/Logo.jpeg")}
                        alt="Inventory Management System"
                      />
                      <span
                        className="text-white font-extrabold text-[18px] md:text-[22px] tracking-wide"
                        style={{ fontFamily: "Vazirmatn, sans-serif" }}
                      >
                        سیستم مدیریت دیپو
                      </span>
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                            <span className="sr-only">Open user menu</span>
                            <img
                              className="h-8 w-8 rounded-full"
                              src={localStorageData.imageUrl}
                              alt="profile"
                            />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <Link
                                    to={item.href}
                                    className={classNames(
                                      active ? "bg-gray-100" : "",
                                      "block px-4 py-2 text-sm text-gray-700"
                                    )}
                                  >
                                    <span onClick={() => authContext.signout()}>
                                      {item.name}{" "}
                                    </span>
                                  </Link>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                  {navigation.map(({ to, name, icon: Icon }) => (
                    <Link to={to} key={name}>
                      <Disclosure.Button
                        as="div"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <Icon className="w-5 h-5 text-indigo-400" />
                        <span>{name}</span>
                      </Disclosure.Button>
                    </Link>
                  ))}
                </div>

                <div className="border-t border-gray-700 pt-4 pb-3">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={localStorageData.imageUrl}
                        alt="profile"
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">
                        {localStorageData.firstName +
                          " " +
                          localStorageData.lastName}
                      </div>
                      <div className="text-sm font-medium leading-none text-gray-400">
                        {localStorageData.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        <span onClick={() => authContext.signout()}>
                          {item.name}{" "}
                        </span>
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </>
  );
}
