import { injectable } from 'inversify';
import * as _ from 'lodash'

export interface IUpdateSpec {
    mapper: <T>(T) => T;
    objectKey: string;
    dbColumnName: string;
}

@injectable()
export class UpdateQueryUtils {
    generateSetStringAndArray = (userObject:any, updateSpecs:IUpdateSpec[]):{setString: string, setArray: any[]} => {
        return _.keys(userObject).filter(userObjectKey => {
            return updateSpecs.map(i => i.objectKey).filter(key => key === userObjectKey)[0];
        })
        .map(key => {
            return _.assign({}, updateSpecs.filter(spec => spec.objectKey === key)[0], {value: userObject[key]});
        })
        .reduce((acc, keyMapperAndValue:IUpdateSpec & {value:any}, index) => {
            return {
                setString: `${acc.setString}${index?',':''}${keyMapperAndValue.dbColumnName}=$${index+1}`,
                setArray: acc.setArray.concat([keyMapperAndValue.mapper(keyMapperAndValue.value)])
            }
        }, {setString: '', setArray: []});
    }
}