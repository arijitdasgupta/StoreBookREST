import { injectable } from 'inversify';
import * as crypto from 'crypto';

@injectable()
export class SHA256Utils {
    private secret: string;

    constructor() {
        this.secret = process.env.PASSWORD_SECRET || 'sha256 secret';
    }

    makeHashFromPassword(password:string):string {
        const hmacHasher = crypto.createHmac('sha256', this.secret);
        hmacHasher.update(password);
        return hmacHasher.digest('hex');
    }
}