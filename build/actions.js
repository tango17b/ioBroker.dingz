"use strict";
/**
 * ioBroker.dingz: Connect Dingz (http://www.dingz.ch) with ioBroker
 * Copyright (c) 2020 by G. Weirich
 * License: See LICENSE
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Actions = void 0;
const main_1 = require("./main");
const node_fetch_1 = require("node-fetch");
class Actions {
    constructor(d) {
        this.d = d;
    }
    createActionObjects() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.d.setObjectAsync("actions", {
                type: "channel",
                common: {
                    name: "actions",
                    role: "state"
                },
                native: {}
            });
            this.d.config.trackbtn1 && (yield this.createAction("btn1"));
            this.d.config.trackbtn2 && (yield this.createAction("btn2"));
            this.d.config.trackbtn3 && (yield this.createAction("btn3"));
            this.d.config.trackbtn4 && (yield this.createAction("btn4"));
			// Pir check einbauen
            this.d.config.trackpir && (yield this.createAction("pir"));
        });
    }
    createAction(acn) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.d.setObjectAsync("actions." + acn, {
                type: "channel",
                common: {
                    name: "Action " + acn,
                },
                native: {}
            });
            yield this.createActionState(acn, "generic");
            if (acn != "pir") {
                yield this.createActionState(acn, "single");
                yield this.createActionState(acn, "double");
                yield this.createActionState(acn, "long");
            }
            // await this.createButtonState(btn, "press_release")
        });
    }
    createActionState(action, substate) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.d.setObjectAsync(`actions.${action}.${substate}`, {
                type: "state",
                common: {
                    name: substate,
                    type: "boolean",
                    def: false,
                    role: "switch",
                    read: true,
                    write: true
                },
                native: {}
            });
            yield this.programAction(action, substate);
        });
    }
    programAction(name, action) {
        // TODO
        const def = `${this.d.config.hostip}/set/dingz.${this.d.instance}.actions.${name}.${action}?value=true&ack=true`;
        this.d.log.info("programming " + name + ": " + JSON.stringify(def));
        const url = `${this.d.config.url}${main_1.API}action/${name}/${action}`;
        this.d.log.info("POSTing " + url + "; " + def);
        return node_fetch_1.default(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "get://" + def.substring("http://".length),
            redirect: "follow"
        }).then(response => {
            if (response.status != 200) {
                this.d.log.error("Error while POSTing command " + response.status + ", " + response.statusText);
            }
            else {
                this.d.log.info("POST successful");
            }
        }).catch(err => {
            this.d.log.error("Exception whilePOSTing: " + err);
        });
    }
	pushButton(id, state) {
        return __awaiter(this, void 0, void 0, function* () {
			// extract button action
			const parts = id.split(".");
			var btnid = 0;
			var btnaction = 'press';
			switch (parts[1]) {
				case 'btn1':
					btnid = 1;
				break;
				case 'btn2':
					btnid = 2;
				break;
				case 'btn3':
					btnid = 3;
				break;				
				case 'btn4':
					btnid = 4;
				break;	
			}
			switch (parts[2]) {
				case 'single':
					btnaction = 'single-press';
				break;
				case 'double':
					btnaction = 'double-press';
				break;
				case 'long':
					btnaction = 'long-press';
				break;				
				case 'generic':
					btnaction = 'press';
				break;	
			}			
			
			
			
			//build url to post
            const url = this.d.config.url + main_1.API + "button/" + btnid + "/" + btnaction;
            this.d.log.info(`Posting ${url}; {button: ${btnid}, action: ${btnaction}}`);
            try {
                let encoded;
               // if (btnid != undefined) {
               //     encoded = new URLSearchParams();
               //     encoded.append("btinid", value.toString());
               //     encoded.append("ramp", ramp.toString());
               // }
                const response = yield node_fetch_1.default(url, {
                    method: "post",
                //    headers: {
                //        "Content-type": "x-www-form-urlencoded"
                 //   },
                    //body: encoded || "",
                    redirect: "follow"
                });
                if (response.status == 200) {
                    this.d.log.info("ok");
					// reset state
					this.d.setState("actions." +parts[1]+"."+parts[2],false, true);
					this.d.setState("actions." +parts[1]+".generic",false, true);
                }
                else {
                    this.d.log.error("Error while posting " + url + ": " + response.status + ", " + response.statusText);
                    this.d.setState("info.connection", false, true);
                }
            }
            catch (err) {
                this.d.log.error("Fatal error during fetch " + err);
                this.d.setState("info.connection", false, true);
            }
        });
    }
}
exports.Actions = Actions;
