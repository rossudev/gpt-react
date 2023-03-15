import { React, useState, createContext } from 'react';
import Chat from "./components/Chat";
import { animated, Spring } from "react-spring";
import debounce from 'lodash/debounce';
import TextareaAutosize from 'react-textarea-autosize';
import axios from "axios";

export const dataContext = createContext();

function App() {
  const [sysMsg, setSysMsg] = useState("You are ChatGPT, a large language model trained by OpenAI. You are also a friendly tech support agent. Answer as concisely as possible. If you don't know the answer to a question, be honest and tell me you don't know.");
  const [componentList, setComponentList] = useState([]);
  const [contactCount, setContactCount] = useState(1);
  const [advancedSetting, setAdvancedSetting] = useState(false);
  const [samplingType, setSamplingType] = useState("temperature");
  const [responseType, setResponseType] = useState("Chat completion");
  const [temperature, setTemperature] = useState("1.0");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [topp, setTopp] = useState("1.0");
  const [token, setToken] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [wrongPass, setWrongPass] = useState(false);
  const [passphrase, setPassphrase] = useState("");

  const makeNewComponent = () => {
    const newChat = { 
      id: Date.now(), 
      numba: contactCount, 
      systemMessage: sysMsg, 
      responseType: responseType, 
      model: model, 
      samplingType: samplingType, 
      temperature: temperature, 
      topp: topp, 
      theID: token, 
      adv: advancedSetting 
    };
    
    setComponentList([...componentList, newChat]);
    setContactCount(contactCount + 1);
  };

  const handleClose = (id) => {
    setComponentList(componentList.filter((container) => container.id !== id));
  };

  function handleSysMsgChange(e) {
    setSysMsg(e.target.value);
  };

  function handleTypeChange(e) {
    setSamplingType(e.target.value);
  };

  function handleRespChange(e) {
    setResponseType(e.target.value);
    switch (e.target.value) {
      case "Chat completion" : 
        setModel("gpt-3.5-turbo");
       break;
      case "Text completion" : 
        setModel("text-davinci-003");
       break;
      case "Code completion" : 
        setModel("code-davinci-002");
       break;
      default : setModel("gpt-3.5-turbo");
    };
  };

  function handleToppChange(e) {
    setTopp(e.target.value);
    setTemperature("1.0");
  };

  function handleTempChange(e) {
    setTemperature(e.target.value);
    setTopp("1.0");
  };

  function handlePassChange(e) {
    setPassphrase(e.target.value);
  };

  function handleModelChange(e) {
    setModel(e.target.value);
  };

  function wrongPassUsed() {
    setWrongPass(true);
    setTimeout(() => {
      setWrongPass(false);
      setTimeout(() => {
        setSubmitted(false);          
      }, 100);
    }, 1000);
  };

  const checkPassword = async () => {
    setSubmitted(true);
    try {
      const response = await axios.post(
        "/chat-auth.php",
        {
          passphrase: passphrase
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      
      const token = response.data.token;
      if (token) {
        setToken(token);
      } else {
        wrongPassUsed();
      };
    } catch (error) {
      console.log(error);
      wrongPassUsed()
    };
  };

  const handleEnterKey = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        checkPassword();
    }
  };

  const handleCheckboxChange = (event) => { 
    const checkedYes = event.target.checked;
    if (!checkedYes) {
      setTemperature("1.0");
      setTopp("1.0");
      setResponseType("Chat completion");
      setModel("gpt-3.5-turbo");
      setSamplingType("temperature");
    };

    setAdvancedSetting(checkedYes); 
  };

  const modelOptions = {
    "Chat completion": [
      { value: "gpt-3.5-turbo", label: "gpt-3.5-turbo" },
      { value: "gpt-3.5-turbo-0301", label: "gpt-3.5-turbo-0301" },
/*       { value: "gpt-4", label: "gpt-4" },
      { value: "gpt-4-0314", label: "gpt-4-0314" },
      { value: "gpt-4-32k", label: "gpt-4-32k" },
      { value: "gpt-4-32k-0314", label: "gpt-4-32k-0314" } */
    ],
    "Text completion": [
      { value: "text-davinci-003", label: "text-davinci-003" },
      { value: "text-davinci-002", label: "text-davinci-002" },
      { value: "text-curie-001", label: "text-curie-001" },
      { value: "text-babbage-001", label: "text-babbage-001" },
      { value: "text-ada-001", label: "text-ada-001" },
      { value: "davinci", label: "davinci" },
      { value: "curie", label: "curie" },
      { value: "babbage", label: "babbage" },
      { value: "ada", label: "ada" }
    ],
    "Code completion": [
      { value: "code-davinci-002", label: "code-davinci-002" },
      { value: "code-cushman-001	", label: "code-cushman-001	" }
    ]
  };

  return (
    <div className={`grid gap-2 md:grid-cols-2 xl:grid-cols-3 place-items-center mt-8`}>
      <dataContext.Provider value={{token, passphrase}}>
        { token &&
          <Spring
            from={{ opacity: 0 }}
            to={[
              { opacity: 1 }
            ]}
            delay={200}>
            {styles => (
              <animated.div onClick={debounce(() => {makeNewComponent();}, 250)} style={styles} className="self-start text-nosferatu-900 md:place-self-end hover:bg-nosferatu-300 cursor-default bg-nosferatu-200 rounded-3xl text-5xl font-bold m-2 p-12 flex items-center justify-center mb-5 bg-gradient-to-tl from-nosferatu-500 hover:from-nosferatu-600 shadow-2xl hover:shadow-marcelin-700 cursor-pointer">
                <i className="fa-solid fa-address-card mr-4 text-nosferatu-800"></i>
                <h1>New Chat</h1>
              </animated.div>
            )}
          </Spring>
        }

        <Spring
          from={{ opacity: 0 }}
          to={[
            { opacity: 1 }
          ]}
          delay={400}>
          {styles => (
            <animated.div style={styles} className="w-[90%] text-nosferatu-900 xl:col-span-2 md:place-self-start hover:bg-nosferatu-300 cursor-default bg-nosferatu-200 rounded-3xl font-bold p-6 flex items-center justify-center m-2 bg-gradient-to-tl from-nosferatu-500 hover:from-nosferatu-600 shadow-2xl hover:shadow-blade-800">
              <div className="w-full">
                { token &&
                  <div className="mb-8 text-3xl"> 
                    <label className="cursor-pointer"><input className="w-8 h-8 cursor-pointer" type="checkbox" name="advancedSetting" checked={advancedSetting} onChange={handleCheckboxChange} /> Advanced Settings</label> 
                  </div>
                }
                <table className="min-w-full">
                    <tbody>
                      { !token && 
                        <tr>
                          <td className="pb-4 tracking-wide text-center font-bold text-nosferatu-900 cursor-pointer">
                          <TextareaAutosize maxRows="15" className="hover:bg-nosferatu-400 p-4 min-w-full bg-nosferatu-100 text-s font-mono text-black ring-1 hover:ring-2 ring-vonCount-900 rounded-xl" onKeyDown={handleEnterKey} placeholder="Passphrase" onChange={(e) => handlePassChange(e)} value={passphrase} />
                          </td>
                          <td className="w-[30%] flex items-stretch"><span className={ submitted ? wrongPass ? "self-center p-4 ml-4 ring-vonCount-600 bg-marcelin-100 rounded-xl hover:bg-marcelin-400" : "self-center p-4 ml-4 ring-vonCount-600 bg-lincoln-100 rounded-xl hover:bg-lincoln-400" : "cursor-pointer self-center p-4 ml-4 ring-vonCount-600 bg-nosferatu-100 rounded-xl hover:bg-nosferatu-400" } onClick={debounce(() => {checkPassword()}, 1500)}>Submit</span></td>
                        </tr>
                      }
                { advancedSetting && 
                    <>
                      <tr>
                        <td className="w-[30%]">Response Type</td>
                        <td className="pb-4 tracking-wide text-center font-bold text-nosferatu-900">
                          <select name="responseType" id="responseType" className="hover:bg-nosferatu-400 cursor-pointer mb-2 p-4 min-w-full bg-nosferatu-100 font-mono rounded-xl text-black ring-1 hover:ring-2 ring-vonCount-900" onChange = {(e) => handleRespChange(e)} value={responseType}>
                              <option value="Chat completion">Chat completion</option>
                              <option value="Text completion">Text completion</option>
                              <option value="Code completion">Code completion</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[30%]">Model</td>
                        <td className="pb-4 tracking-wide text-center font-bold text-nosferatu-900">
                          <select name="model" id="model" className="hover:bg-nosferatu-400 cursor-pointer mb-2 p-4 min-w-full bg-nosferatu-100 font-mono rounded-xl text-black ring-1 hover:ring-2 ring-vonCount-900" onChange = {(e) => handleModelChange(e)} value={model}>
                            {modelOptions[responseType].map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[30%]">Sampling Type</td>
                        <td className="pb-4 tracking-wide text-center font-bold text-nosferatu-900">
                          <select name="samplingType" id="samplingType" className="hover:bg-nosferatu-400 cursor-pointer mb-2 p-4 min-w-full bg-nosferatu-100 font-mono rounded-xl text-black ring-1 hover:ring-2 ring-vonCount-900" onChange = {(e) => handleTypeChange(e)} value={samplingType}>
                              <option value="temperature">temperature</option>
                              <option value="topp">top_p</option>
                          </select>
                        </td>
                      </tr>
                      { samplingType === "temperature" ? 
                        <tr>
                          <td className="w-[30%] pb-2">temperature</td>
                          <td className="pb-4 tracking-wide text-center font-bold text-nosferatu-900">
                            <select name="temperature" id="temperature" className="hover:bg-nosferatu-400 cursor-pointer mb-2 p-4 min-w-full bg-nosferatu-100 font-mono rounded-xl text-black ring-1 hover:ring-2 ring-vonCount-900" onChange = {(e) => handleTempChange(e)} value={temperature}>
                                <option value="0.0">0.0</option>
                                <option value="0.1">0.1</option>
                                <option value="0.2">0.2</option>
                                <option value="0.3">0.3</option>
                                <option value="0.4">0.4</option>
                                <option value="0.5">0.5</option>
                                <option value="0.6">0.6</option>
                                <option value="0.7">0.7</option>
                                <option value="0.8">0.8</option>
                                <option value="0.9">0.9</option>
                                <option value="1.0">1.0</option>
                                <option value="1.1">1.1</option>
                                <option value="1.2">1.2</option>
                                <option value="1.3">1.3</option>
                                <option value="1.4">1.4</option>
                                <option value="1.5">1.5</option>
                                <option value="1.6">1.6</option>
                                <option value="1.7">1.7</option>
                                <option value="1.8">1.8</option>
                                <option value="1.9">1.9</option>
                                <option value="2.0">2.0</option>
                            </select>
                          </td>
                        </tr>
                      :
                        <tr>
                          <td className="w-[30%]">top_p</td>
                          <td className="pb-4 tracking-wide text-center font-bold text-nosferatu-900">
                            <select name="topp" id="topp" className="hover:bg-nosferatu-400 cursor-pointer mb-2 p-4 min-w-full bg-nosferatu-100 font-mono rounded-xl text-black ring-1 hover:ring-2 ring-vonCount-900" onChange = {(e) => handleToppChange(e)} value={topp}>
                              <option value="0.01">0.01</option>
                              <option value="0.02">0.02</option>
                              <option value="0.03">0.03</option>
                              <option value="0.04">0.04</option>
                              <option value="0.05">0.05</option>
                              <option value="0.06">0.06</option>
                              <option value="0.07">0.07</option>
                              <option value="0.08">0.08</option>
                              <option value="0.09">0.09</option>
                              <option value="0.1">0.1</option>
                              <option value="0.2">0.2</option>
                              <option value="0.3">0.3</option>
                              <option value="0.4">0.4</option>
                              <option value="0.5">0.5</option>
                              <option value="0.6">0.6</option>
                              <option value="0.7">0.7</option>
                              <option value="0.8">0.8</option>
                              <option value="0.9">0.9</option>
                              <option value="1.0">1.0</option>
                            </select>
                          </td>
                        </tr>
                      }
                    </>
                }
                    </tbody>
                  </table>
                { token && <>
                  { (responseType === "Chat completion") &&
                  <div>
                    <TextareaAutosize maxRows="5" className="w-full font-bold col-span-2 hover:bg-nosferatu-400 p-2 bg-nosferatu-100 text-sm font-mono text-black ring-1 hover:ring-2 ring-vonCount-900 rounded-xl" placeholder="'System' Message" onChange={(e) => handleSysMsgChange(e)} value={sysMsg} />
                  </div>
                  } </>
                }
              </div>
            </animated.div>
          )}
        </Spring> 
      
        {componentList.slice().reverse().map((container) => (
          <Chat 
            key={container.id} 
            systemMessage={container.systemMessage} 
            responseType={container.responseType} 
            model={container.model} 
            samplingType={container.samplingType} 
            adv={container.adv} 
            temperature={container.temperature} 
            topp={container.topp} 
            userID={container.theID} 
            onClose={() => handleClose(container.id)} numba={container.numba}
          />
        ))}
      </dataContext.Provider>
    </div>
  );
};

export default App;