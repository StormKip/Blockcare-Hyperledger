/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction, Property } from 'fabric-contract-api';
import { Patient } from './patient-model';
import { Doctor } from './doctor-model';
import { MedicalRecord } from './medical-record-model'
import {Blockcare} from './blockcare';

@Info({title: 'Blockcare', description: 'Blockcare' })
export class BlockcareContract extends Contract {

    @Transaction()
    public async init(ctx: Context){
            console.info('init invoked')
    }


    @Transaction()
    public async createBlockcare(ctx: Context, blockcareId: string, value: string): Promise<void> {
        const exists = await this.blockcareExists(ctx, blockcareId);
        if (exists) {
            throw new Error(`The my asset ${blockcareId} already exists`);
        }
        const blockcare = new Blockcare();
        blockcare.value = value;
        const buffer = Buffer.from(JSON.stringify(blockcare));
        await ctx.stub.putState(blockcareId, buffer);
    }

    @Transaction(false)
    @Returns('boolean')
    public async blockcareExists(ctx: Context, blockcareTypescriptId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(blockcareTypescriptId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createDoctor(ctx: Context, doctorId: string, firstName:string, lastName:string, specialization:string): Promise<void> {
        const exists = await this.blockcareExists(ctx, doctorId);
        if (exists) {
            throw new Error(`The doctor ${doctorId} already exists`);
        }
        const doctor = new Doctor();
        doctor.id = doctorId;
        doctor.firstName = firstName;
        doctor.lastName = lastName;
        doctor.specialization = specialization;
        doctor.patientIds = [];
        
        const doctorIdsArray = await this.blockcareExists(ctx, "doctorIds");
        let doctorIds =[];
        if (doctorIdsArray) {
            let doctorIdsBuffer = await ctx.stub.getState("doctorIds");
            let doctorIds = JSON.parse(doctorIdsBuffer.toString()) as Array<string>;
            doctorIds.push(doctorId);
            doctorIdsBuffer = Buffer.from(JSON.stringify(doctorIds));
            await ctx.stub.putState("doctorIds", doctorIdsBuffer);
        }else{
            doctorIds.push(doctorId);
            let doctorIdsBuffer = Buffer.from(JSON.stringify(doctorIds));
            await ctx.stub.putState("doctorIds", doctorIdsBuffer);
        }

        const buffer = Buffer.from(JSON.stringify(doctor));
        await ctx.stub.putState(doctorId, buffer);
    }

    @Transaction()
    public async createPatient(ctx: Context, id: string, firstName:string, lastName:string): Promise<void> {
        const exists = await this.blockcareExists(ctx, id);
        if (exists) {
            throw new Error(`The patient ${id} already exists`);
        }
        const patient = new Patient();
        patient.id = id;
        patient.firstName = firstName;
        patient.lastName = lastName;
        patient.medicalRecordsIds = [];
        
        const patientIdsArray = await this.blockcareExists(ctx, "patientIds");
        let patientIds =[];
        if (patientIdsArray) {
            let patientIdsBuffer = await ctx.stub.getState("patientIds");
            let patientIds = JSON.parse(patientIdsBuffer.toString()) as Array<string>;
            patientIds.push(id);
            patientIdsBuffer = Buffer.from(JSON.stringify(patientIds));
            await ctx.stub.putState("patientIds", patientIdsBuffer);
        }else{
            patientIds.push(id);
            let patientIdsBuffer = Buffer.from(JSON.stringify(patientIds));
            await ctx.stub.putState("patientIds", patientIdsBuffer);
        }
       
       
        const buffer = Buffer.from(JSON.stringify(patient));
        await ctx.stub.putState(id, buffer);
    }

    @Transaction()
    public async createMedicalRecord(ctx: Context, id: string, initialDoctorId:string, patientId:string, smoking:boolean, allergies:string): Promise<void>{
        const exists = await this.blockcareExists(ctx, id);
        if (exists) {
            throw new Error(`The medical record ${id} already exists`);
        }

        let arrayAllergies = allergies.split(",")

        // let obj = {
        //     id: id,
        //     initialDoctorId: initialDoctorId,
        //     patientId: patientId,
        //     smoking: smoking,
        //     allergies: arrayAllergies
        // }

        // return obj;

        const medicalRecord = new MedicalRecord();
        medicalRecord.id = id;
        medicalRecord.authorizedDoctors = [initialDoctorId];
        medicalRecord.patientId = patientId;
        medicalRecord.smoking = smoking;
        medicalRecord.allergies = arrayAllergies;


        const patientExists = await this.blockcareExists(ctx, patientId);
        if (!patientExists) {
            throw new Error(`The doctor ${initialDoctorId} does not exist`);
        }
        let patientBuffer = await ctx.stub.getState(patientId);
        let patient = JSON.parse(patientBuffer.toString()) as Patient;
        let medicalRecordsPatient = patient.medicalRecordsIds;

        medicalRecordsPatient.push(id);
        patient.medicalRecordsIds = medicalRecordsPatient;
        const bufferPatient = Buffer.from(JSON.stringify(patient));
        await ctx.stub.putState(patientId, bufferPatient);


        const doctorExists = await this.blockcareExists(ctx, initialDoctorId);
        if (!doctorExists) {
            throw new Error(`The doctor ${initialDoctorId} does not exist`);
        }
        
        let doctorBuffer = await ctx.stub.getState(initialDoctorId);
        let doctor = JSON.parse(doctorBuffer.toString()) as Doctor;
        let patientIds = doctor.patientIds;

        patientIds.push(patientId);
        doctor.patientIds = patientIds;
        const bufferDoctor = Buffer.from(JSON.stringify(doctor));
        await ctx.stub.putState(initialDoctorId, bufferDoctor);

        const buffer = Buffer.from(JSON.stringify(medicalRecord));
        await ctx.stub.putState(id, buffer);


        const medicalRecordIdsArray = await this.blockcareExists(ctx, "medicalRecordIds");
        let medicalRecordIds =[];
        if (medicalRecordIdsArray) {
            let medicalRecordIdsBuffer = await ctx.stub.getState("medicalRecordIds");
            let medicalRecordIds = JSON.parse(medicalRecordIdsBuffer.toString()) as Array<string>;
            medicalRecordIds.push(id);
            medicalRecordIdsBuffer = Buffer.from(JSON.stringify(medicalRecordIds));
            await ctx.stub.putState("medicalRecordIds", medicalRecordIdsBuffer);
        }else{
            medicalRecordIds.push(id);
            let medicalRecordIdsBuffer = Buffer.from(JSON.stringify(medicalRecordIds));
            await ctx.stub.putState("medicalRecordIds", medicalRecordIdsBuffer);
        }

    }


    @Transaction(false)
    @Returns('Doctor')
    public async getDoctorById(ctx: Context, doctorId: string): Promise<Doctor> {
        const exists = await this.blockcareExists(ctx, doctorId);
        if (!exists) {
            throw new Error(`The doctor ${doctorId} does not exist`);
        }
        const buffer = await ctx.stub.getState(doctorId);
        const doctor = JSON.parse(buffer.toString()) as Doctor;
        return doctor;
    }

    @Transaction(false)
    @Returns('Patient')
    public async getPatientById(ctx: Context, patientId: string): Promise<Patient> {
        const exists = await this.blockcareExists(ctx, patientId);
        if (!exists) {
            throw new Error(`The patient ${patientId} does not exist`);
        }
        const buffer = await ctx.stub.getState(patientId);
        const patient = JSON.parse(buffer.toString()) as Patient;
        return patient;
    }

    @Transaction(false)
    @Returns('Array<Patient>')
    public async getPatientsByDoctorId(ctx: Context, doctorId: string): Promise<Array<Patient>> {
        const exists = await this.blockcareExists(ctx, doctorId);
        if (!exists) {
            throw new Error(`The patient ${doctorId} does not exist`);
        }
        const buffer = await ctx.stub.getState(doctorId);
        const doctor = JSON.parse(buffer.toString()) as Doctor;
        let patientIds = doctor.patientIds;
        let Patients = [];
        if(patientIds.length <1){
            throw new Error(`No patients available`);
        }
        for(let i = 0; i<patientIds.length;i++){
            let bufferPatient = await ctx.stub.getState(patientIds[i]);
            let patient = JSON.parse(bufferPatient.toString()) as Patient;
            Patients.push(patient);
        }
        return Patients;
    }

    @Transaction(false)
    @Returns('Array<MedicalRecord>')
    public async getMedicalRecordsForPatient(ctx: Context, patientId: string): Promise<Array<MedicalRecord>> {
        const exists = await this.blockcareExists(ctx, patientId);
        if (!exists) {
            throw new Error(`The patient ${patientId} does not exist`);
        }
        const buffer = await ctx.stub.getState(patientId);
        const patient = JSON.parse(buffer.toString()) as Patient;
        let medicalRecordsIds = patient.medicalRecordsIds;
        let MedicalRecords = [];
        if(medicalRecordsIds.length <1){
            throw new Error(`No medical records available`);
        }
        for(let i = 0; i<medicalRecordsIds.length;i++){
            let bufferRecord = await ctx.stub.getState(medicalRecordsIds[i]);
            let MedicalRecord = JSON.parse(bufferRecord.toString()) as MedicalRecord;
            MedicalRecords.push(MedicalRecord);
        }
        return MedicalRecords;
    }

    @Transaction(false)
    @Returns('Array<Patient>')
    public async getAllPatients(ctx: Context): Promise<Array<Patient>> {
        const exists = await this.blockcareExists(ctx, "patientIds");
        if (!exists) {
            throw new Error(`No Patients exist`);
        }
        const buffer = await ctx.stub.getState("patientIds");
        const patientIds = JSON.parse(buffer.toString()) as Array<string>;
        
        let Patients = [];
        
        for(let i = 0; i<patientIds.length;i++){
            let bufferPatient = await ctx.stub.getState(patientIds[i]);
            let patient = JSON.parse(bufferPatient.toString()) as Patient;
            Patients.push(patient);
        }
        return Patients;
    }

    @Transaction(false)
    @Returns('Array<Patient>')//medicalRecordIds patientIds doctorIds
    public async getAllMedicalRecords(ctx: Context): Promise<Array<MedicalRecord>> {
        const exists = await this.blockcareExists(ctx, "medicalRecordIds");
        if (!exists) {
            throw new Error(`No Medical Records exist`);
        }
        const buffer = await ctx.stub.getState("medicalRecordIds");
        const medicalRecordIdIds = JSON.parse(buffer.toString()) as Array<string>;
        
        let MedicalRecords = [];
        
        for(let i = 0; i<medicalRecordIdIds.length;i++){
            let bufferMedicalRecord = await ctx.stub.getState(medicalRecordIdIds[i]);
            let medicalRecord = JSON.parse(bufferMedicalRecord.toString()) as MedicalRecord;
            MedicalRecords.push(medicalRecord);
        }
        return MedicalRecords;
    }

    @Transaction(false)
    @Returns('Array<Patient>')//medicalRecordIds patientIds doctorIds
    public async getAllDoctors(ctx: Context): Promise<Array<Doctor>> {
        const exists = await this.blockcareExists(ctx, "doctorIds");
        if (!exists) {
            throw new Error(`No Medical Records exist`);
        }
        const buffer = await ctx.stub.getState("doctorIds");
        const doctorIds = JSON.parse(buffer.toString()) as Array<string>;
        
        let Doctors = [];
        
        for(let i = 0; i<doctorIds.length;i++){
            let bufferDoctor = await ctx.stub.getState(doctorIds[i]);
            let doctor = JSON.parse(bufferDoctor.toString()) as Doctor;
            Doctors.push(doctor);
        }
        return Doctors;
    }

    @Transaction()
    public async grantAccessToMedicalRecord(ctx: Context, doctorId: string, medicalRecordId: string): Promise<void> {
        const mExists = await this.blockcareExists(ctx, medicalRecordId);
        if (!mExists) {
            throw new Error(`The medical Record ${medicalRecordId} does not exist`);
        }
        const dExists = await this.blockcareExists(ctx, doctorId);
        if (!dExists) {
            throw new Error(`The doctor ${doctorId} does not exist`);
        }


        let medicalRecordBuffer = await ctx.stub.getState(medicalRecordId);
        let medicalRecord = JSON.parse(medicalRecordBuffer.toString()) as MedicalRecord;
        medicalRecord.authorizedDoctors.push(doctorId);
        
        let doctorBuffer = await ctx.stub.getState(doctorId);
        let doctor = JSON.parse(doctorBuffer.toString()) as Doctor;
        let patientId = medicalRecord.patientId;
        doctor.patientIds.push(patientId);

         medicalRecordBuffer = Buffer.from(JSON.stringify(medicalRecord));
        await ctx.stub.putState(medicalRecordId, medicalRecordBuffer);

         doctorBuffer = Buffer.from(JSON.stringify(doctor));
        await ctx.stub.putState(doctorId, doctorBuffer);
        
    }

    @Transaction()
    public async revokeAccessFromMedicalRecord(ctx: Context, doctorId: string, medicalRecordId: string): Promise<void> {
        const mExists = await this.blockcareExists(ctx, medicalRecordId);
        if (!mExists) {
            throw new Error(`The medical Record ${medicalRecordId} does not exist`);
        }
        const dExists = await this.blockcareExists(ctx, doctorId);
        if (!dExists) {
            throw new Error(`The doctor ${doctorId} does not exist`);
        }


        let medicalRecordBuffer = await ctx.stub.getState(medicalRecordId);
        let medicalRecord = JSON.parse(medicalRecordBuffer.toString()) as MedicalRecord;
        let list = medicalRecord.authorizedDoctors

        let index = list.map(x=>{
            return x;
        }).indexOf(doctorId);

        list.splice(index,1);
        medicalRecord.authorizedDoctors = list;

        medicalRecordBuffer = Buffer.from(JSON.stringify(medicalRecord));
        await ctx.stub.putState(medicalRecordId, medicalRecordBuffer);


        let doctorBuffer = await ctx.stub.getState(doctorId);
        let doctor = JSON.parse(doctorBuffer.toString()) as Doctor;
        let patientId = medicalRecord.patientId;
        let patientList = doctor.patientIds;

        let patientIndex = patientList.map(id=>{
            return id
        }).indexOf(patientId);

        patientList.splice(patientIndex,1);
        doctor.patientIds = patientList;

         doctorBuffer = Buffer.from(JSON.stringify(doctor));
        await ctx.stub.putState(doctorId, doctorBuffer);
        
    }
}
