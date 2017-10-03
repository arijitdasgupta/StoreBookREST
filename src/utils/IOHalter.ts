import { injectable } from 'inversify';

@injectable()
export class IOHalter {
    private promises: Promise<any>[] = [];
    
    addPromise = (promise: Promise<any>) => {
        this.promises.push(promise);
    }

    getAllPromises = () => {
        return this.promises;
    }
}