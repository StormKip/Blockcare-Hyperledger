/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class MedicalRecord {

    @Property()
    public id: string;
    
    @Property('authorizedDoctors', 'Array<string>')
    public authorizedDoctors: string[];

    @Property()
    public patientId: string;

    @Property()
    public smoking: boolean;

    @Property('allergies', 'Array<string>')
    public allergies: string[];

}