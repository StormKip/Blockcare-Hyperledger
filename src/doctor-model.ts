/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property, Param } from 'fabric-contract-api';

@Object()
export class Doctor {

    @Property()
    public id: string;
    
    @Property()
    public firstName: string;

    @Property()
    public lastName: string;

    @Property()
    public specialization: string;

    @Property('patientIds', 'Array<string>')
    public patientIds: string[];

}