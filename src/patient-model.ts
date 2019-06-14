/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Patient {

    @Property()
    public id: string;
    
    @Property()
    public firstName: string;

    @Property()
    public lastName: string;

    @Property('medicalRecordsIds', 'Array<string>')
    public medicalRecordsIds: string[];

}
