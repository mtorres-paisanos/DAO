import React, { useState, useEffect } from "react";
import "./pages.css";
import { Tag, Widget, Blockie, Tooltip, Icon, Form, Table } from "web3uikit";
import { Link } from "react-router-dom";
import { useLocation } from "react-router";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import paisano from "../images/paisano.png";
import nelsen from "../images/nelsen.png";
import ninja from "../images/ninja.png";
const axios = require("axios");

const Proposal = () => {
  const { state: proposalDetails } = useLocation();
  const { Moralis, isInitialized } = useMoralis();
  const [latestVote, setLatestVote] = useState();
  const [percUp, setPercUp] = useState(0);
  const [percDown, setPercDown] = useState(0);
  const [votes, setVotes] = useState([]);
  const [sub, setSub] = useState(false);
  const contractProcessor = useWeb3ExecuteFunction();
  const dotenv = require("dotenv");
  const [rolHeader, setRolHeader] = useState("");
  const [rolImg, setRolImg] = useState("");
  const [classRolHeader, setClassRolHeader] = useState();
  const [rolContext, setRolContext] = useState("");

  dotenv.config();

  async function onInit() {
    await window.ethereum.enable();
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts[0];
    try {
      const response = await axios.get("http://localhost:3000/account/verify/" + accounts);
      await updateRol(response.data);
    } catch (error) {
      return [];
    }
    window.ethereum.on("accountsChanged", async function (accounts) {
      try {
        const response = await axios.get("http://localhost:3000/account/verify/" + accounts[0]);
        await updateRol(response.data);
      } catch (error) {
        return [];
      }
    });
  }

  async function updateRol(data) {
    if (data.level === "NELSEN") {
      setRolImg(nelsen);

      setRolContext("Nelsen Supreme");
    }
    if (data.level === "PAISANO") {
      setRolImg(paisano);

      setRolContext("Paisano");
    }
    if (data.level === "NINJA") {
      setRolImg(ninja);
      setRolContext("Ninja");
    }
  }

  useEffect(() => {
    if (isInitialized) {
      console.log(proposalDetails);
      onInit();
    }
  }, [isInitialized]);

  /*async function castVote(upDown) {
    let options = {
      contractAddress: process.env.REACT_APP_SMART_CONTRACT,
      functionName: "voteOnProposal",
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_id",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_vote",
              type: "bool",
            },
          ],
          name: "voteOnProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      params: {
        _id: proposalDetails.id,
        _vote: upDown,
      },
    };

    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        console.log("Vote Cast Succesfully");
        setSub(false);
      },
      onError: (error) => {
        alert(error.message);
        setSub(false);
      },
    });
  }
  */

  return (
    <>
      <div className="contentPageProposal">
        <div className="SpaceGroteskLight margin-top-11px FS16px description-proposal">
          <div>
            <img
              src={rolImg}
              className="icons-rol-proposal"
              width="40"
              height="40"
              alt="Imagen de rol"
            ></img>
            <div className="titulo-proposal2">
              <div className="titulo-proposal">Nivel:</div>
              <div className="titulo-proposal">{rolContext}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Proposal;
