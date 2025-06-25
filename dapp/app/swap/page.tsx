"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import { Mail, Shield, CheckCircle, AlertCircle, House } from "lucide-react";
import { SwapForm } from "./components/SwapForm";
import Link from "next/link";
import { DAO, DAO_MAPPING } from "@/lib/daoMapping";

export default function SwapPage() {
  const [emailContent, setEmailContent] = useState("");
  const [step, setStep] = useState<
    "dao" | "input" | "email" | "pending" | "success" | "rejected"
  >("dao");
  const [emailSent, setEmailSent] = useState(false);
  const [selectedDao, setSelectedDao] = useState<DAO | undefined>();
  const [verificationEmail, setVerificationEmail] = useState<
    | {
        emailId: string;
        targetEmail: string;
      }
    | undefined
  >();

  const handleSubmitDao = () => {
    // const targetEmail = getTargetEmailAddressAndId();
    // setVerificationEmail(targetEmail);
    // setStep("email");
  };

  const handleEmailSent = () => {
    setEmailSent(true);
    setStep("pending");
  };

  const resetSwap = () => {
    setStep("dao");
    setEmailSent(false);
  };

  if (step === "dao") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center items-center">
                <House className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="card-title text-2xl justify-center mb-4">
                  Select your DAO
                </h2>
                <p className="mb-6">
                  Select the DAO for which you are a member, contributor,
                  delegate...
                </p>

                <div className="dropdown w-1/2">
                  <button
                    tabIndex={0}
                    className="btn btn-outline w-full justify-between">
                    {selectedDao ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={selectedDao.iconURL}
                          alt={`${selectedDao.name} logo`}
                          className="w-6 h-6 rounded-full"
                        />
                        {selectedDao.name}
                      </div>
                    ) : (
                      "Pick a dao"
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-full mt-2">
                    {DAO_MAPPING.map((dao) => (
                      <li key={dao.name}>
                        <button
                          onClick={() => setSelectedDao(dao)}
                          className="flex items-center gap-2">
                          <img
                            src={dao.iconURL}
                            alt={`${dao.name} logo`}
                            className="w-6 h-6 rounded-full"
                          />
                          {dao.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-actions justify-center mt-6">
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmitDao}
                    disabled={!selectedDao?.tokenAddress}>
                    {selectedDao
                      ? `I work for ${selectedDao.name} ✓`
                      : "No dao selected"}
                  </button>
                  <Link className="btn btn-ghost" href="/">
                    Cancel
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "email") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="card-title text-2xl justify-center mb-4">
                  Email Verification Required
                </h2>
                <p className="mb-6">
                  To complete your swap for <strong>USDC</strong>, please send
                  an email from your verified company email address.
                </p>

                <div className="alert alert-info mb-6">
                  <Shield className="w-5 h-5" />
                  <div className="text-left">
                    <h4 className="font-semibold">Email Instructions:</h4>
                    <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                      <li>
                        Send an email to:{" "}
                        <code className="bg-base-300 text-white px-1 rounded">
                          {verificationEmail?.targetEmail}
                        </code>
                      </li>
                      <li>Use your company email address (@yourcompany.com)</li>
                      <li>Subject: "Swap Verification to USDC"</li>
                      <li>Include your wallet address in the email body</li>
                    </ol>
                  </div>
                </div>

                <div className="card-actions justify-center">
                  <button
                    className="btn btn-primary"
                    onClick={handleEmailSent}
                    disabled={emailSent}>
                    {emailSent ? "Email Sent ✓" : "I've Sent the Email"}
                  </button>
                  <button className="btn btn-ghost" onClick={resetSwap}>
                    return
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <h2 className="card-title text-2xl justify-center mb-4">
                  Swap Authorized!
                </h2>
                <p className="mb-6">
                  Your swap for <strong>USDC</strong> has been authorized and
                  executed.
                </p>

                <div className="stats shadow mb-6">
                  <div className="stat">
                    <div className="stat-title">Transaction Hash</div>
                    <div className="stat-value text-sm font-mono">
                      0x1234...5678
                    </div>
                    <div className="stat-desc">View on Etherscan</div>
                  </div>
                </div>

                <div className="card-actions justify-center">
                  <button className="btn btn-primary" onClick={resetSwap}>
                    Make Another Swap
                  </button>
                  <button className="btn btn-ghost">View Transaction</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "rejected") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
                <h2 className="card-title text-2xl justify-center mb-4">
                  Swap Rejected
                </h2>
                <p className="mb-6">
                  Your swap request was rejected. This could be due to:
                </p>

                <div className="alert alert-error mb-6">
                  <AlertCircle className="w-5 h-5" />
                  <div className="text-left">
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Email sent from unauthorized domain</li>
                      <li>Insufficient verification information</li>
                      <li>Pool liquidity constraints</li>
                      <li>Security policy violation</li>
                    </ul>
                  </div>
                </div>

                <div className="card-actions justify-center">
                  <button className="btn btn-primary" onClick={resetSwap}>
                    Try Again
                  </button>
                  <button className="btn btn-ghost">Contact Support</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <SwapForm
        expectedDomain={selectedDao!.tokenAddress}
        emailContent={emailContent}
        onComplete={(result: boolean) =>
          setStep(result ? "success" : "rejected")
        }
      />
    </div>
  );
}
