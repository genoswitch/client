import { Constants } from "../constants";
import { BoardInfo } from "../structs/vendor/boardInfo";
import { BuildInfo } from "../structs/vendor/buildInfo";
import { FeatureSet } from "../structs/vendor/featureSet";
import { Version } from "../structs/vendor/version";
import { BulkListener } from "./bulkListener";
import { IPredicate } from "./interface/filters";

export class WorkerClient {
	private device: USBDevice = undefined;
	private interface: USBInterface = undefined;

	private bulkListener: BulkListener = undefined;

	// 'Cached' items from vendor requests
	private version: Version;
	private buildInfo: BuildInfo;
	private boardInfo: BoardInfo;
	private featureSet: FeatureSet;

	hasDevice() {
		return this.device != undefined;
	}

	hasOpenedDevice() {
		if (this.device != undefined) {
			return this.device.opened;
		} else {
			// Device is undefined, so cannot be opened.
			return false;
		}
	}

	getDevice() {
		return this.device;
	}

	getInterface() {
		return this.interface;
	}

	getBulkListener() {
		return this.bulkListener;
	}

	setDevice(device: USBDevice) {
		this.device = device;
	}

	setInterface(iface: USBInterface) {
		this.interface = iface;
	}

	setBulkListener(listener: BulkListener) {
		this.bulkListener = listener;
	}

	// Assumes device is alraedy available
	findInterface(predicate: IPredicate) {
		const interfaces = this.device.configuration.interfaces;

		const matches = interfaces.filter(predicate);

		if (matches.length == 1) {
			return matches[0];
		} else {
			throw new Error(`Unexpected number of matches found. Expected 1, found ${matches.length}.`);
		}
	}

	private async makeVendorRequest(value: number, len: number) {
		return await this.device.controlTransferIn(
			{
				requestType: "vendor",
				recipient: "endpoint",
				index: 3,
				request: 3,
				value,
			},
			len
		);
	}

	async getVersion() {
		// Check to see if the version has already been requested and 'cached'
		if (!this.version) {
			// Not in 'cache', request again.
			const vendorResponse = await this.makeVendorRequest(1, 128);
			this.version = new Version(vendorResponse);
		}

		// this.version is now available
		// (If the above block errors/fails it's promise will be rejected so we will not get here)
		return this.version;
	}

	async getBuildInfo() {
		// Check to see if the build info has already been requested and 'cached'
		if (!this.buildInfo) {
			// Not in 'cache', request again.
			const vendorResponse = await this.makeVendorRequest(2, 128);
			this.buildInfo = new BuildInfo(vendorResponse);
		}

		// this.buildInfo is now available
		// (If the above block errors/fails it's promise will be rejected so we will not get here)
		return this.buildInfo;
	}

	async getBoardInfo() {
		// Check to see if the board info has already been requested and 'cached'
		if (!this.boardInfo) {
			// Not in 'cache', request again.
			const vendorResponse = await this.makeVendorRequest(3, 128);
			this.boardInfo = new BoardInfo(vendorResponse);
		}

		// this.boardInfo is now available
		// (If the above block errors/fails it's promise will be rejected so we will not get here)
		return this.boardInfo;
	}

	async getFeatureSet() {
		// Check to see if the feature set has already been requested and 'cached'
		if (!this.featureSet) {
			// Not in 'cache', request again
			const vendorResponse = await this.makeVendorRequest(4, 128);
			this.featureSet = new FeatureSet(vendorResponse);
		}

		// this.featureSet is now available
		// (If the above block errors/fails it's promise will be rejected so we will not get here)
		return this.featureSet;
	}
}
