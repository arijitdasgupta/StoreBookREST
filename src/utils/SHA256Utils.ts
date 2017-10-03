import { injectable } from 'inversify';
import * as crypto from 'crypto';

export class SHA256Utils {
    constructor(private secret: string) {}

    makeHashFromPassword(password:string):string {
        const hmacHasher = crypto.createHmac('sha256', this.secret);
        hmacHasher.update(password);
        return hmacHasher.digest('hex');
    }
}