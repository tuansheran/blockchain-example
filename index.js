"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
class Transaction {
    constructor(amount, payer, payee) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    toString() {
        return JSON.stringify(this);
    }
}
class Block {
    constructor(prevHash, transaction, ts = Date.now()) {
        this.prevHash = prevHash;
        this.transaction = transaction;
        this.ts = ts;
        this.nounce = Math.round(Math.random() * 9999999);
    }
    get hash() {
        const str = JSON.stringify(this);
        const hash = crypto.createHash('SHA256');
        hash.update(str).end();
        return hash.digest('hex');
    }
}
class Chain {
    constructor() {
        this.chain = [new Block('', new Transaction(100, 'genesis', 'sheranBuckman'))];
    }
    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }
    mine(nounce) {
        let solution = 1;
        console.log('Minining.....');
        while (true) {
            const hash = crypto.createHash('MD5');
            hash.update((nounce + solution).toString()).end();
            const attempt = hash.digest('hex');
            if (attempt.substring(0, 4) === '0000') {
                console.log(`Solved: ${solution}`);
                return solution;
            }
            solution = solution + 1;
        }
    }
    addBlock(transaction, senderPublicKey, signature) {
        //verify SHA256 signature
        const verify = crypto.createVerify('SHA256');
        verify.update(transaction.toString());
        const isValid = verify.verify(senderPublicKey, signature);
        if (isValid) {
            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.nounce);
            this.chain.push(newBlock);
        }
    }
}
Chain.instance = new Chain();
class Wallte {
    constructor() {
        const keyPair = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });
        this.privateKey = keyPair.privateKey;
        this.publicKey = keyPair.publicKey;
    }
    sendMoney(amout, payeePublicKey) {
        const transaction = new Transaction(amout, this.publicKey, payeePublicKey);
        // sign money crypto
        const sign = crypto.createSign('SHA256');
        sign.update(transaction.toString()).end();
        const signature = sign.sign(this.privateKey);
        //add to block chain
        Chain.instance.addBlock(transaction, this.publicKey, signature);
    }
}
//example usage 
const peer1 = new Wallte();
const peer2 = new Wallte();
const peer3 = new Wallte();
// send money
peer1.sendMoney(50, peer2.publicKey);
peer2.sendMoney(100, peer1.publicKey);
peer3.sendMoney(500, peer3.publicKey);
console.log(Chain.instance);
