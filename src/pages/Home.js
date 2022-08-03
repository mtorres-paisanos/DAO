import React, { useEffect, useState } from "react";
import {
  TabList,
  Tab,
  Widget,
  Table,
  Form,
  Button,
  Information,
  Badge,
  Loading,
  Tag,
} from "web3uikit";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import toast, { Toaster } from "react-hot-toast";

import "./pages.css";
import "../fonts/fonts.css";

import { CONTRACT_ABI } from "./__mock__/Contracts";
import { Link } from "react-router-dom";

import barrasImg from "../images/barras.png";
import checkImg from "../images/check.png";
import medalla from "../images/medalla.png";
import paisano from "../images/paisano.png";
import nelsen from "../images/nelsen.png";
import ninja from "../images/ninja.png";

const dotenv = require("dotenv");
const Web3 = require("web3");
const axios = require("axios");

dotenv.config();

let web3 = undefined;
web3 = new Web3(new Web3.providers.HttpProvider(process.env.REACT_APP_WEB3_PROVIDER));

const Home = () => {
  const [passRate, setPassRate] = useState(0);
  const [totalP, setTotalP] = useState(0);
  const [firstPlace, setFirstPlace] = useState(0);
  const [rol, setRol] = useState("");
  const [rolContext, setRolContext] = useState("");
  const [rolDescription, setRolDescription] = useState("");
  const [rolImg, setRolImg] = useState(paisano);
  const [voters, setVoters] = useState(0);
  const [winners, setWinners] = useState(0);
  const [menuKey, setMenuKey] = useState(1);
  const { isInitialized, Moralis, confirm } = useMoralis();
  const { address, setAddress } = useState(0);
  const [proposals, setProposals] = useState();
  const contractProcessor = useWeb3ExecuteFunction();
  const [sizePage, setSizePage] = useState(window.innerWidth);

  async function getProposalsBySmartContract() {
    const contactList = new web3.eth.Contract(CONTRACT_ABI, process.env.REACT_APP_SMART_CONTRACT);

    let cache = [];
    const COUNTER = await contactList.methods.countProporsals().call();
    let votes = 0;
    for (let i = 0; i < COUNTER; i++) {
      const proposal = await contactList.methods.proposals(i).call();
      votes = votes + parseInt(proposal.votes);
      cache = [...cache, proposal];
    }

    return cache;
  }

  async function getWinners() {
    const contactList = new web3.eth.Contract(CONTRACT_ABI, process.env.REACT_APP_SMART_CONTRACT);

    let cache = [];
    const COUNTER = await contactList.methods.countProporsalsWinners().call();

    for (let i = COUNTER - 1; i >= 0; i--) {
      const proposal = await contactList.methods.proposalsWin(i).call();
      if (i === COUNTER - 1) {
        proposal.nuevo = (
          <Badge
            state="success"
            text="NUEVO"
            textVariant="caption12"
            style={{ padding: "0 2.1rem", width: "100%" }}
          />
        );
      } else {
        proposal.nuevo = <div style={{ width: "14vh" }}></div>;
      }
      cache = [...cache, proposal];
    }

    const table = await Promise.all(
      cache.map(async (e) => [e.id, e.description, e.votes, e.nuevo])
    );

    setWinners(table);
  }

  async function createProposal(newProposal) {
    let options = {
      contractAddress: process.env.REACT_APP_SMART_CONTRACT,
      functionName: "createProposal",
      abi: [
        {
          inputs: [
            {
              internalType: "string",
              name: "_description",
              type: "string",
            },
          ],
          name: "createProposal",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      params: {
        _description: newProposal,
        _canVote: voters,
      },
    };

    toast.promise(
      contractProcessor.fetch({
        params: options,
        onSuccess: () => {
          setTimeout(function () {
            getProposals();
          }, 15000);
          var element = document.querySelector("button[id='form-submit']");
          element.removeAttribute("disabled");
        },
        onError: (error) => {
          let err = new Error("Not Found");
          err.httpError = 401;

          const errorMessage = error?.data?.message ? error.data.message : error;

          err.message = errorMessage;
          var element = document.querySelector("button[id='form-submit']");
          element.removeAttribute("disabled");
          throw err;
        },
      }),
      {
        loading: "Creando propuesta...",
        success: <b>Propuesta creada con éxito. Puede demorar unos minutos en verse reflejada</b>,
        error: (error) => `${error.toString()}`,
      }
    );
  }

  async function getProposals() {
    const results = await getProposalsBySmartContract();
    const proposals = results.sort(function (a, b) {
      return b.id - a.id;
    });

    const table = await Promise.all(
      proposals.map(async (e, i) => [
        e.id,
        e.description,
        e.votes,
        <Link
          to="/proposal"
          state={{
            description: e.description,
            color: "green",
            text: "Ver",
            id: e.id,
            proposer: e.votes,
          }}
        >
          <Tag color="green" text="Ver" />
        </Link>,
      ])
    );

    setProposals(table);
  }

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
      setRol(" Nelsen Supreme ");
      setRolContext("Nelsen Supreme");
      setRolDescription(
        " añadir personas nivel PAISANO y NINJA, crear categorias, crear propuestas y votar propuestas."
      );
    }
    if (data.level === "PAISANO") {
      setRolImg(paisano);
      setRol(" Paisano ");
      setRolContext("Paisano");
      setRolDescription(" votar propuestas.");
    }
    if (data.level === "NINJA") {
      setRolImg(ninja);
      setRol(" Ninja ");
      setRolContext("Ninja");
      setRolDescription(
        " añadir personas nivel PAISANO, crear categorias, crear propuestas y votar propuestas."
      );
    }
  }

  useEffect(() => {
    if (isInitialized) {
      async function getPassRate() {
        const contactList = new web3.eth.Contract(
          CONTRACT_ABI,
          process.env.REACT_APP_SMART_CONTRACT
        );

        let cache = [];
        const COUNTER = await contactList.methods.countProporsals().call();
        let countedVotes = 0;
        for (let i = 0; i < COUNTER; i++) {
          const proposal = await contactList.methods.proposals(i).call();
          countedVotes = countedVotes + parseInt(proposal.votes);
          cache = [...cache, proposal];
        }
        let results = cache;
        let votesMax = 0;
        let votes = 0;
        let description = "";
        for (let i = 0; i < results.length; i++) {
          votes = results[i].votes;
          if (votes > votesMax) {
            votesMax = votes;
            description = results[i].description;
          }
        }

        setFirstPlace(description);
        setTotalP(results.length);
        setPassRate((votesMax / countedVotes) * 100);
        onInit();
      }

      const fetchTokenIdOwners = async () => {
        const contactList = new web3.eth.Contract(
          CONTRACT_ABI,
          process.env.REACT_APP_SMART_CONTRACT
        );

        const COUNTER = await contactList.methods.idVoter().call();

        setVoters(COUNTER);
      };

      // async function getAll() {
      //   getProposals();
      //   getWinners();
      //   getPassRate();
      // }
      fetchTokenIdOwners();
      getProposals();
      getWinners();
      getPassRate();

      // setInterval(getAll, 60000);
    }
  }, [isInitialized]);

  return (
    <>
      <Toaster />
      <TabList defaultActiveKey={menuKey} tabStyle="bar" className="content">
        <Tab tabKey={1} tabName={<div className="menu">Propuestas</div>}>
          {!proposals ? (
            <div className="loading">
              <Loading size="48" />
            </div>
          ) : (
            <div className="tabContent">
              <div className="National2CompressedRegular FS56px margin-bottom16px">BIENVENID@!</div>
              <div className="SpaceGroteskLight margin-bottom36px FS16px description">
                <div>
                  <img
                    src={rolImg}
                    className="icons-rol"
                    width="100"
                    height="100"
                    alt="Imagen de rol"
                  ></img>
                </div>
              </div>
              <div className="SpaceGroteskLight margin-bottom36px FS16px description">
                Sos nivel
                <b className="FS16px-yellow">{rol}</b>y en este nivel podrás
                <b className="FS16px-yellow">{rolDescription}</b>
              </div>

              <div className="National2CompressedRegular FS36px title">
                <div>
                  <img
                    src={barrasImg}
                    className="icons-style"
                    width="27"
                    height="27"
                    alt="Imagen de barras de Estadísticas"
                  ></img>
                </div>
                ESTADÍSTICAS
              </div>
              <div style={{ marginTop: "20px" }}>
                <div className="widgets">
                  <Widget info={firstPlace} title="Primer lugar" style={{ width: "32vh" }}>
                    <div className="extraWidgetInfo">
                      <div className="extraTitle">% Votos</div>
                      <div className="progress">
                        <div className="progressPercentage" style={{ width: `${passRate}%` }}></div>
                      </div>
                    </div>
                  </Widget>
                </div>
              </div>
              <div className="widgets">
                <Information information={voters} topic="Votantes" style={{ width: "16vh" }} />
                <Information information={totalP} topic="Propuestas" style={{ width: "16vh" }} />
              </div>
              <div style={{ marginTop: "40px" }}>
                <div className="FS36px">
                  <Button
                    id="closeVotation"
                    theme="primary"
                    type="button"
                    text="Cerrar votación"
                    onClick={async function closeVotation() {
                      let options = {
                        contractAddress: process.env.REACT_APP_SMART_CONTRACT,
                        functionName: "closeVotation",
                        abi: [
                          {
                            inputs: [],
                            name: "closeVotation",
                            outputs: [],
                            stateMutability: "nonpayable",
                            type: "function",
                          },
                        ],
                      };

                      toast.promise(
                        contractProcessor.fetch({
                          params: options,
                          onSuccess: () => {
                            setMenuKey(2);
                            setTimeout(function () {
                              getProposals();
                            }, 10000);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          },
                          onError: (error) => {
                            let err = new Error("Not Found");
                            err.httpError = 401;

                            const errorMessage = error?.data?.message ? error.data.message : error;

                            err.message = errorMessage;

                            throw err;
                          },
                        }),
                        {
                          loading: "Cerrando votación...",
                          success: <b>Propuesta votada</b>,
                          error: (error) => `${error.toString()}`,
                        }
                      );
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: "60px" }}>
                <div className="National2CompressedRegular FS36px title">
                  <div>
                    <img
                      src={checkImg}
                      className="icons-style"
                      width="27"
                      height="27"
                      alt="Imagen de check de Propuestas"
                    ></img>
                  </div>
                  PROPUESTAS PARA TEAM BUILDING
                </div>
                <div
                  style={{
                    marginTop: "20px",
                    maxWidth: "50vh",
                  }}
                >
                  <Table
                    columnsConfig="10% 50% 10% 30%"
                    data={proposals}
                    header={[
                      <span>ID</span>,
                      <span>Descripción</span>,
                      <span>Votos</span>,
                      <span> </span>,
                    ]}
                    pageSize={5}
                  />
                </div>
              </div>
              <div style={{ marginTop: "40px", width: "100%", maxWidth: "40vh" }}>
                <Form
                  buttonConfig={{
                    isLoading: false,
                    loadingText: "Submitting Proposal",
                    text: "Submit",
                    theme: "secondary",
                  }}
                  data={[
                    {
                      inputWidth: "100%",
                      name: "New Proposal",
                      type: "textarea",
                      validation: {
                        required: true,
                      },
                      value: "",
                    },
                  ]}
                  onSubmit={(e) => {
                    createProposal(e.data[0].inputResult);
                  }}
                  title="Crear una nueva propuesta"
                />
              </div>
            </div>
          )}
        </Tab>
        <Tab tabKey={2} tabName={<div className="menu">Ganadores</div>}>
          {!winners ? (
            <div className="loading">
              <Loading size="48" />
            </div>
          ) : (
            <div className="tabContent">
              <div className="National2CompressedRegular FS36px title">
                <img
                  src={medalla}
                  className="icons-style"
                  width="27"
                  height="27"
                  alt="Imagen medalla propuesta ganadora"
                ></img>
                PROPUESTAS GANADORAS
              </div>
              <div style={{ marginTop: "20px", maxWidth: "40vh" }}>
                <Table
                  columnsConfig="15% 50% 7% 18%"
                  data={winners}
                  header={[
                    <span>ID</span>,
                    <span>Descripción</span>,
                    <span>Votos</span>,
                    <span> </span>,
                  ]}
                  pageSize={5}
                  className="table"
                />
              </div>
            </div>
          )}
        </Tab>

        {/* <Tab tabKey={3} tabName="Docs"></Tab> */}
      </TabList>
      <div className="voting"></div>
    </>
  );
};

export default Home;
