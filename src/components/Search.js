"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import StellarSdk from "stellar-sdk";
import { useRouter } from "next/navigation";
import { usePublic } from "@/context/net";

const SearchBar = () => {
    const [search, setSearch] = useState("");
    const [net] = usePublic();
    const router = useRouter();
    const [errorvalid, setErrorvalid] = useState(null);
    const [exists, setExists] = useState(null);

    const changeHandler = (e) => {
        setErrorvalid(null);
        setSearch(e.currentTarget.value);
    };

    const checkAccount = async () => {
        const serverUrl =
            net === "testnet"
                ? "https://horizon-testnet.stellar.org"
                : "https://horizon.stellar.org";
        const server = new StellarSdk.Server(serverUrl);

        try {
            await server.loadAccount(search);
            setExists(true);
            router.push(`/${net}/account?id=${search}`);
        } catch (e) {
            if (e instanceof StellarSdk.NotFoundError) {
                setExists(false);
                setErrorvalid(
                    "Error: Account does not exist on the network. Make sure that you copied the account address correctly and there was at least one payment to this address."
                );
            } else {
                console.error(e);
                setErrorvalid("An unexpected error occurred. Please try again.");
            }
        }
    };

    const searchHandler = () => {
        if (search === "") {
            return;
        }

        if (StellarSdk.StrKey.isValidEd25519PublicKey(search)) {
            checkAccount();
        } else {
            setExists(false);
            setErrorvalid(`Not found at ${search}`);
        }
    };

    const keyDownHandler = (e) => {
        if (e.keyCode === 13) {
            searchHandler();
        }
    };

    return (
        <>
            {errorvalid ? (
                <div className={`search ${exists === false ? "error" : ""} container narrow`} style={{ padding: "20px" }}>
                    <h2 className="text-overflow">Search results for {search}</h2>
                    {exists === null && <p>Loading...</p>}
                    {exists === false && <span>{errorvalid}</span>}
                </div>
            ) : (
                ""
            )}
            <div className="search-wrapper">
                <div
                    style={{
                        position: "absolute",
                        right: "1em",
                        color: "#0691b7",
                        cursor: "pointer",
                        opacity: ".3",
                        marginTop: "-8px",
                    }}
                    onClick={searchHandler}
                >
                    <Search />
                </div>
                <input
                    className={"search"}
                    value={search}
                    onKeyDown={(e) => keyDownHandler(e)}
                    onChange={(e) => changeHandler(e)}
                    placeholder="Paste an account address here"
                />
            </div>
        </>
    );
};

export default SearchBar;
