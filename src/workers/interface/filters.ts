import { ClassCodes } from "./classCodes";

/**
 * We used to use the endpoint number to find the correct interface.
 * However, endpoint numbers can change depending on the board in use.
 * A more robust approach is to match the interface class, protocol and
 * subclass to find the corect interface.
 */
export const Filters = {
	VENDOR: (iface: USBInterface) => iface.alternate.interfaceClass == ClassCodes.VENDOR_SPECIFIC,
	DFU: (iface: USBInterface) =>
		iface.alternate.interfaceClass == ClassCodes.APPLICATION_SPECIFIC &&
		iface.alternate.interfaceProtocol == ClassCodes.IFACE_PROTOCOL_DFU_MODE &&
		iface.alternate.interfaceSubclass == ClassCodes.IFACE_SUBCLASS_DFU,
};

export interface IPredicate {
	(iface: USBInterface): boolean;
}
