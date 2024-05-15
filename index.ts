import * as crypto from 'crypto';

class Transaction {
    constructor(
        public amount: number,
        public payer: string,
        public payee: string,
    ){}

    toString(){
        return JSON.stringify(this)
    }
}


class Block {

    public nounce = Math.round(Math.random() * 9999999);

    constructor(
        public prevHash: string,
        public transaction: Transaction,
        public ts = Date.now()
    ){

    }

    get hash(){
        const str = JSON.stringify(this);
        const hash = crypto.createHash('SHA256');
        hash.update(str).end();
        return hash.digest('hex');
    }
}



class Chain{
    
    public static instance = new Chain();
    chain: Block[];
    
    constructor(){
        this.chain = [new Block('', new Transaction(100, 'genesis', 'sheranBuckman'))]
    }

    get lastBlock(){
        return this.chain[this.chain.length - 1];
    }

    mine(nounce: number){
        let solution = 1;
        console.log('Minining.....');

        while(true){
            const hash = crypto.createHash('MD5');
            hash.update((nounce + solution).toString()).end();

            const attempt = hash.digest('hex');

            if(attempt.substring(0, 4) === '0000'){
                console.log(`Solved: ${solution}`);
                return solution;
            }

            solution = solution + 1;
        }

    }

    addBlock(transaction: Transaction, senderPublicKey: string, signature: Buffer){
        //verify SHA256 signature
        const verify = crypto.createVerify('SHA256');
        verify.update(transaction.toString());

        const isValid = verify.verify(senderPublicKey, signature);

        if(isValid){
            const newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.nounce);
            this.chain.push(newBlock);
        }
    }
}

class Wallte{
    public publicKey: string;
    public privateKey: string;

    constructor(){
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
        })

        this.privateKey = keyPair.privateKey;
        this.publicKey = keyPair.publicKey;
    }

    sendMoney(amout: number, payeePublicKey: string){
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