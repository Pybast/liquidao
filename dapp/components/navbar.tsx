import Link from "next/link";
import { Shield, Zap } from "lucide-react";
import { RainbowKitCustomConnectButton } from "./ConnectButton";

export default function Navbar() {
  return (
    <div className="navbar bg-base-200 shadow-lg">
      <div className="navbar-start">
        <Link href="/" className="btn btn-ghost normal-case text-xl">
          <img
            src="/logos/liquidao_sq_256.png"
            alt="Logo"
            className="w-8 h-8 rounded-full mr-1"
          />
          LiquiDAO
        </Link>
      </div>
      <div className="navbar-center lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/dao/create" className="btn btn-ghost">
              Create DAO Pool
            </Link>
          </li>
          <li>
            <Link href="/swap" className="btn btn-ghost">
              Swap
            </Link>
          </li>
          <li>
            <Link href="/pools" className="btn btn-ghost">
              Pools
            </Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
}
