/* eslint-disable no-useless-concat */
import { React, useState, useContext } from 'react';
import axios from "axios";
import TextareaAutosize from 'react-textarea-autosize';
import XClose from "./XClose";
import { dataContext } from "../App";
import { debounce } from 'lodash';
import copy from "copy-to-clipboard";
import Hyphenated from 'react-hyphen';

const Chat = ({numba, onClose, systemMessage, responseType, model, samplingType, temperature, topp, userID, adv}) => {
    const {token, passphrase} = useContext(dataContext);

    const [chatInput, setChatInput] = useState("");
    const [isClicked, setIsClicked] = useState(false);
    const [sentOne, setSentOne] = useState(false);

    const [chatMessages, setChatMessages] = useState(() => {
        switch (responseType) {
        case "Chat completion":
            return [{"role": "system", "content": systemMessage}];
        default:
            return [];
        }
    });

    const fetchData = async (input) => {
        let endPath = "";
        let sendPacket = {};
        switch (responseType) {
          case "Chat completion" : 
              endPath = "https://api.openai.com/v1/chat/completions";
              sendPacket = {
                  model: model,
                  messages: chatMessages.concat({ "role": "user", "content": input }),
                  temperature: parseFloat(temperature),
                  top_p: parseFloat(topp),
                  user: userID
              };
          break;
          default : 
              endPath = "https://api.openai.com/v1/completions";
              sendPacket = {
                  model: model,
                  prompt: input,
                  temperature: parseFloat(temperature),
                  top_p: parseFloat(topp),
                  user: userID
              };
          break;
        };

        try {
            const response = await axios.post(
                "/chat-send.php",
                {
                  passphrase: passphrase,
                  token: token,
                  sendPacket: sendPacket,
                  endPath: endPath
                },
                {
                  headers: {
                    "Content-Type": "application/json"
                  }
                }
              );

              const parseStr = JSON.parse(response.data.answer);
              console.log(parseStr);

              let theEnd = null;  

              switch (responseType) {
                  case "Chat completion" : 
                      theEnd = parseStr.choices[0].message.content;
                  break;
                  default : 
                      theEnd = parseStr.choices[0].text;
                  break;
              };
  
              return theEnd;
        } catch (error) {
          console.log(error);
        };
    };

    const handleChat = debounce(async () => {
        if ( chatInput ) {
            setIsClicked(true);
            setChatInput("");
            try {
                const chatOut = await fetchData(chatInput);
                setSentOne(true);
                setIsClicked(false);
                setChatMessages(chatMessages.concat({ "role": "user", "content": chatInput }, { "role": "assistant", "content": chatOut }));
            } catch (error) {
                setIsClicked(false);
                console.error(error);
                setChatMessages(chatMessages.concat({ "role": "user", "content": chatInput }, { "role": "assistant", "content": "Error: " + error }));
            };
        };
    }, 1000, { leading: true, trailing: false });
     
    const handleEnterKey = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleChat();
        }
    };

    const chatHandler = () => event => {
        const value = event.target.value;
        setChatInput(value);
    };

    const handleCopy = (e) => {
        e.preventDefault();
        const selectedText = document.getSelection().toString();
        const textContent = selectedText.replace(/\u00AD/g, '');
        navigator.clipboard.writeText(textContent);
    };

    const copyClick = (value) => {
        if (typeof value === 'string') {
          copy(value);
        };
    };

    return (
        <div className="min-w-full self-start mt-1 mb-1 inline p-6 bg-nosferatu-200 rounded-3xl bg-gradient-to-tl from-nosferatu-500 shadow-2xl">
            <table className="border-separate border-spacing-y-4">
                <tbody>
                    <tr>
                        <td colSpan="2" className="pb-4 tracking-wide text-4xl text-center font-bold text-nosferatu-900">
                            <i className="fa-regular fa-comments mr-4 text-nosferatu-800"></i>
                            { adv ? responseType : "Chat" } #{numba}
                        </td>
                        <td>
                            <XClose onClose={onClose} />
                        </td>
                    </tr>
                    {adv &&
                        <tr>
                            <td>Model: {model}</td>
                            <td>temperature: {temperature}</td>
                            <td>top_p: {topp}</td>
                        </tr>
                    }
                    {chatMessages.map((obj, index) => (
                        <tr key={index}>
                            <td onCopy={handleCopy} colSpan="3" className={obj.role === "user" || obj.role === "system" ? 
                                  "py-3 p-3 bg-lincoln-300 font-sans rounded-xl text-black-800 text-sm ring-1 whitespace-pre-wrap" : 
                                  "py-3 whitespace-pre-wrap p-3 bg-nosferatu-800 font-mono rounded-xl text-vanHelsing-200 text-sm ring-1"}>
                                <div className="items-end justify-end text-right mb-3">
                                    <i onClick={() => copyClick(obj.content)} className="m-2 fa-solid fa-copy fa-2x cursor-pointer shadow-xl hover:shadow-dracula-900"></i>
                                </div>
                                <div>
                                    <Hyphenated>
                                        {obj.content}
                                    </Hyphenated>
                                </div>
                            </td>
                        </tr>
                    ))}
                    { ( !sentOne || (responseType === "Chat completion") ) && 
                     <tr>
                        <td colSpan="2">
                            <TextareaAutosize autoFocus onKeyDown={handleEnterKey} minRows="3" maxRows="15" className="placeholder:text-6xl placeholder:italic mt-3 hover:bg-nosferatu-400 p-4 min-w-full bg-nosferatu-100 text-sm font-mono text-black ring-1 hover:ring-2 ring-vonCount-900 rounded-xl" placeholder="Chat" onChange={chatHandler()} value={chatInput} />
                        </td>
                        <td className="items-baseline justify-evenly text-center align-middle text-4xl">
                            <i onClick={ !isClicked ? () => handleChat() : null } className={ isClicked ? "text-dracula-500 mt-4 m-2 fa-solid fa-hat-wizard fa-2x cursor-pointer hover:text-dracula-900" : "text-blade-300 mt-4 m-2 fa-solid fa-message fa-2x cursor-pointer hover:text-blade-800" }></i>
                        </td>
                    </tr>
                    }
                </tbody>
            </table>
        </div>
    )
};

export default Chat;