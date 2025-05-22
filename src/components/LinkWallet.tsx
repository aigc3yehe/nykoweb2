import { useAtom, useSetAtom } from "jotai";
import { accountAtom } from "../store/accountStore";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useMemo, useState } from "react";
import { CheckCircleOutline } from "@mui/icons-material";
import WalletIcon from "../assets/wallet.svg";
import PrivyIcon from "../assets/privy.svg";
import { Link } from "react-router-dom";
import { updateLinkedExternalWalletAtom } from "../store/accountStore";
import { showToastAtom } from "../store/imagesStore";
import { formatAddress } from "../utils/format";
import { useMediaQuery } from "@mui/material";

const LinkWallet = () => {
  const [accountState] = useAtom(accountAtom);
  const { login, authenticated, ready, linkWallet, user } = usePrivy();
  const { wallets } = useWallets();
  const [, updateLinkedExternalWallet] = useAtom(
    updateLinkedExternalWalletAtom
  );
  const showToast = useSetAtom(showToastAtom);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 744px)");

  const linkedWallet = useMemo(() => {
    return wallets?.find(
      (item) =>
        item.type == "ethereum" &&
        item.walletClientType !== "privy" &&
        item.linked
    );
  }, [wallets]);

  const linkedState = useMemo(() => {
    if (accountState.linked_wallet) {
      return "linked";
    }
    if (!accountState.linked_wallet && linkedWallet) {
      return "pending";
    }
    return "none";
  }, [accountState, linkedWallet]);

  const linkWalletHandle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await updateLinkedExternalWallet(linkedWallet?.address);
      showToast({
        message: "Linked successfully",
        severity: "success",
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to link wallet:", error);
      showToast({
        message: "Failed to link wallet",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const linkHandle = () => {
    if (authenticated && ready) {
      linkWallet({
        walletChainType: "ethereum-only",
      });
    }
    login();
  };

  const UnLinkHeader = () => {
    return (
      <div className="flex flex-col items-center justify-center gap-3 w-full">
        <div className="text-white pc:text-4xl text-2xl font-bold uppercase text-center">
          Link another wallet to your NYKO Account
        </div>
        <button
          className="bg-[#6366F1] text-black px-5 py-2 rounded-[4px] hover:brightness-125"
          onClick={linkHandle}
        >
          Connet Wallet
        </button>
      </div>
    );
  };

  const PendingConfirmHeader = () => {
    return (
      <div className="flex flex-col items-center justify-center gap-6 w-full">
        {/* title */}
        <div className="text-white pc:text-4xl text-2xl font-bold uppercase text-center">
          Link another wallet to your NYKO Account
        </div>
        {/* wallet info */}
        <div className="flex w-full pc:px-6 px-4 py-4 items-center justify-between text-[#1F29371A] border border-[#3741514D] rounded-[1px]">
          <div className="flex items-center pc:gap-6 gap-3">
            <div className="text-sm font-medium text-white">
              External Wallet
            </div>
            <div className="flex items-center gap-2">
              <img src={WalletIcon} width={24} height={24} />
              <div className="text-sm font-medium text-[#88A4C2]">
                {isMobile
                  ? formatAddress(linkedWallet?.address)
                  : linkedWallet?.address}
              </div>
            </div>
          </div>
          <button
            className="text-[#88A4C2] bg-[#1F293766] border border-[#3741514D] text-sm font-bold px-4 py-[0.4rem] rounded-[1px] hover:brightness-125"
            onClick={() => {
              linkedWallet?.unlink();
            }}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  };

  const LinkedHeader = () => {
    return (
      <div className="flex flex-col items-center w-full">
        <CheckCircleOutline style={{ fontSize: "5rem", color: "#34C759" }} />
        <div className="text-[#34C759] pc:text-2xl text-lg font-bold capitalize text-center">
          You have successfully connected your external wallet !
        </div>
      </div>
    );
  };

  const Tips = () => {
    return (
      <div className="flex flex-col gap-4 capitalize bg-[#FACC1505] border border-[#FACC1514] rounded-[4px] p-6 w-full">
        <div className="text-white text-base font-normal">
          Connect your wallet to accumulate the staked amount from this wallet
          to your NYKO account.
        </div>
        <div className="flex flex-col text-[#FFFFFFB2] gap-4 text-sm">
          <li className="flex gap-3 items-center">
            <span className="w-[5px] h-[5px] bg-[#6366F1]" />
            Each NYKO account can only link to one external wallet.
          </li>
          <li className="flex gap-3 items-center">
            <span className="w-[5px] h-[5px] bg-[#6366F1]" />
            Each external wallet can only be linked to one NYKO account.
          </li>
          <li className="flex gap-3 items-center">
            <span className="w-[5px] h-[5px] bg-[#6366F1]" />
            Once linked, it cannot be unlinked.
          </li>
        </div>
      </div>
    );
  };

  const UserInfo = () => {
    return (
      <div className="flex flex-col gap-6 w-full bg-[#1F29371A] border border-[#3741514D] p-6">
        {/* Twitter */}
        <div className="flex items-center gap-2">
          <div className="pc:w-1/6 w-1/3">Your X</div>
          <div className="gap-2 items-center flex">
            <img
              src={user?.twitter?.profilePictureUrl || ""}
              width={24}
              height={24}
              className="border border-[#37415180] rounded-full"
            />
            <div className="text-[#88A4C2] text-sm font-medium">
              {user?.twitter?.name}
            </div>
          </div>
        </div>
        {/* Pirvy Wallet */}
        <div className="flex items-center gap-2 w-full">
          <div className="pc:w-1/6 w-1/3">Your Privy Wallet</div>
          <div className="gap-2 items-center flex">
            <img src={PrivyIcon} width={24} height={24} />
            <div className="text-[#88A4C2] text-sm font-medium">
              {isMobile
                ? formatAddress(user?.wallet?.address)
                : user?.wallet?.address}
            </div>
          </div>
        </div>
        {/* External Wallet */}
        {accountState.linked_wallet && (
          <div className="flex items-center gap-2">
            <div className="pc:w-1/6 w-1/3">External Wallet</div>
            <div className="gap-2 items-center flex">
              <img src={WalletIcon} width={24} height={24} />
              <div className="text-[#88A4C2] text-sm font-medium">
                {isMobile
                  ? formatAddress(accountState.linked_wallet)
                  : accountState.linked_wallet}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const BottomButton = () => {
    return (
      <div>
        {linkedState == "pending" && (
          <button
            className="bg-[#34C759] text-black text-xl font-bold px-10 py-2 rounded-[4px] hover:brightness-125"
            disabled={loading}
            onClick={linkWalletHandle}
          >
            {loading ? "Confirming..." : "Confirm"}
          </button>
        )}
        {linkedState == "linked" && (
          <Link to="/">
            <button className="bg-[#6366F1] text-black text-xl font-bold px-7 py-2 rounded-[4px] hover:brightness-125">
              Go to homepage
            </button>
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="flex w-full h-full justify-center py-6 text-white font-['Jura'] overflow-y-scroll">
      <div className="flex flex-col items-center gap-6 pc:w-[80rem] w-full p-4">
        {linkedState == "linked" && <LinkedHeader />}
        {linkedState == "pending" && <PendingConfirmHeader />}
        {linkedState == "none" && <UnLinkHeader />}
        {linkedState != "linked" && <Tips />}
        {linkedState == "linked" && <UserInfo />}
        {linkedState != "linked" && (
          <div className="flex pc:text-2xl text-xl font-bold text-white w-full items-center justify-center">
            Link To
          </div>
        )}
        {linkedState == "linked" && <Tips />}
        {linkedState != "linked" && <UserInfo />}
        <BottomButton />
      </div>
    </div>
  );
};

export default LinkWallet;
