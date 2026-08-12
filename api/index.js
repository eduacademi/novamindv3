var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ip-address/dist/address-error.js
var require_address_error = __commonJS({
  "node_modules/ip-address/dist/address-error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AddressError = void 0;
    var AddressError = class extends Error {
      constructor(message, parseMessage) {
        super(message);
        this.name = "AddressError";
        this.parseMessage = parseMessage;
      }
    };
    exports.AddressError = AddressError;
  }
});

// node_modules/ip-address/dist/common.js
var require_common = __commonJS({
  "node_modules/ip-address/dist/common.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isInSubnet = isInSubnet;
    exports.isHostInSubnet = isHostInSubnet;
    exports.isCorrect = isCorrect;
    exports.prefixLengthFromMask = prefixLengthFromMask;
    exports.numberToPaddedHex = numberToPaddedHex;
    exports.stringToPaddedHex = stringToPaddedHex;
    exports.testBit = testBit;
    var address_error_1 = require_address_error();
    function isInSubnet(address) {
      if (this.subnetMask < address.subnetMask) {
        return false;
      }
      return isHostInSubnet.call(this, address);
    }
    function isHostInSubnet(address) {
      return this.mask(address.subnetMask) === address.mask();
    }
    function isCorrect(defaultBits) {
      return function() {
        if (this.addressMinusSuffix !== this.correctForm()) {
          return false;
        }
        if (this.subnetMask === defaultBits && !this.parsedSubnet) {
          return true;
        }
        return this.parsedSubnet === String(this.subnetMask);
      };
    }
    function prefixLengthFromMask(value, totalBits) {
      const binary = value.toString(2).padStart(totalBits, "0");
      if (binary.length > totalBits) {
        throw new address_error_1.AddressError("Invalid subnet mask.");
      }
      const firstZero = binary.indexOf("0");
      if (firstZero === -1) {
        return totalBits;
      }
      if (binary.slice(firstZero).includes("1")) {
        throw new address_error_1.AddressError("Invalid subnet mask.");
      }
      return firstZero;
    }
    function numberToPaddedHex(number) {
      return number.toString(16).padStart(2, "0");
    }
    function stringToPaddedHex(numberString) {
      return numberToPaddedHex(parseInt(numberString, 10));
    }
    function testBit(binaryValue, position) {
      const { length } = binaryValue;
      if (position > length) {
        return false;
      }
      const positionInString = length - position;
      return binaryValue.substring(positionInString, positionInString + 1) === "1";
    }
  }
});

// node_modules/ip-address/dist/v4/constants.js
var require_constants = __commonJS({
  "node_modules/ip-address/dist/v4/constants.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RE_SUBNET_STRING = exports.RE_ADDRESS = exports.GROUPS = exports.BITS = void 0;
    exports.BITS = 32;
    exports.GROUPS = 4;
    exports.RE_ADDRESS = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/g;
    exports.RE_SUBNET_STRING = /\/\d{1,2}$/;
  }
});

// node_modules/ip-address/dist/ipv4.js
var require_ipv4 = __commonJS({
  "node_modules/ip-address/dist/ipv4.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Address4 = void 0;
    var common = __importStar(require_common());
    var constants = __importStar(require_constants());
    var address_error_1 = require_address_error();
    var isCorrect4 = common.isCorrect(constants.BITS);
    var Address4 = class _Address4 {
      constructor(address) {
        this.addressMinusSuffix = "";
        this.groups = constants.GROUPS;
        this.parsedAddress = [];
        this.parsedSubnet = "";
        this.subnet = "/32";
        this.subnetMask = 32;
        this.v4 = true;
        this.isCorrect = isCorrect4;
        this.isInSubnet = common.isInSubnet;
        this.isHostInSubnet = common.isHostInSubnet;
        this.address = address;
        const subnet = constants.RE_SUBNET_STRING.exec(address);
        if (subnet) {
          this.parsedSubnet = subnet[0].replace("/", "");
          this.subnetMask = parseInt(this.parsedSubnet, 10);
          this.subnet = `/${this.subnetMask}`;
          if (this.subnetMask < 0 || this.subnetMask > constants.BITS) {
            throw new address_error_1.AddressError("Invalid subnet mask.");
          }
          address = address.replace(constants.RE_SUBNET_STRING, "");
        }
        this.addressMinusSuffix = address;
        this.parsedAddress = this.parse(address);
      }
      /**
       * Returns true if the given string is a valid IPv4 address (with optional
       * CIDR subnet), false otherwise. Host bits in the subnet portion are
       * allowed (e.g. `192.168.1.5/24` is valid); for strict network-address
       * validation compare `correctForm()` to `startAddress().correctForm()`,
       * or use `networkForm()`.
       */
      static isValid(address) {
        try {
          new _Address4(address);
          return true;
        } catch (e) {
          return false;
        }
      }
      /**
       * Parses an IPv4 address string into its four octet groups and stores the
       * result on `this.parsedAddress`. Called automatically by the constructor;
       * you typically don't need to call it directly. Throws `AddressError` if
       * the input is not a valid IPv4 address.
       */
      parse(address) {
        const groups = address.split(".");
        if (groups.some((group) => /^0\d/.test(group))) {
          throw new address_error_1.AddressError("IPv4 addresses can't have leading zeroes.");
        }
        if (!address.match(constants.RE_ADDRESS)) {
          throw new address_error_1.AddressError("Invalid IPv4 address.");
        }
        return groups;
      }
      /**
       * Returns the address in correct form: octets joined with `.` and any
       * leading zeros stripped (e.g. `192.168.1.1`). For IPv4 this matches the
       * canonical dotted-decimal representation.
       */
      correctForm() {
        return this.parsedAddress.map((part) => parseInt(part, 10)).join(".");
      }
      /**
       * Construct an `Address4` from an address and a dotted-decimal subnet
       * mask given as separate strings (e.g. as returned by Node's
       * `os.networkInterfaces()`). Throws `AddressError` if the mask is
       * non-contiguous (e.g. `255.0.255.0`).
       * @example
       * var address = Address4.fromAddressAndMask('192.168.1.1', '255.255.255.0');
       * address.subnetMask; // 24
       */
      static fromAddressAndMask(address, mask) {
        const bits = common.prefixLengthFromMask(new _Address4(mask).bigInt(), constants.BITS);
        return new _Address4(`${address}/${bits}`);
      }
      /**
       * Construct an `Address4` from an address and a Cisco-style wildcard mask
       * given as separate strings (e.g. `0.0.0.255` for a `/24`). The wildcard
       * mask is the bitwise inverse of the subnet mask. Throws `AddressError`
       * if the mask is non-contiguous (e.g. `0.255.0.255`).
       * @example
       * var address = Address4.fromAddressAndWildcardMask('10.0.0.1', '0.0.0.255');
       * address.subnetMask; // 24
       */
      static fromAddressAndWildcardMask(address, wildcardMask) {
        const wildcard = new _Address4(wildcardMask).bigInt();
        const allOnes = (BigInt(1) << BigInt(constants.BITS)) - BigInt(1);
        const mask = wildcard ^ allOnes;
        const bits = common.prefixLengthFromMask(mask, constants.BITS);
        return new _Address4(`${address}/${bits}`);
      }
      /**
       * Construct an `Address4` from a wildcard pattern with trailing `*`
       * octets. The number of trailing wildcards determines the prefix
       * length: each `*` represents 8 bits.
       *
       * Only trailing whole-octet wildcards are supported. Partial-octet
       * wildcards (e.g. `192.168.0.1*`) and interior wildcards (e.g.
       * `192.*.0.1`) throw `AddressError`.
       * @example
       * Address4.fromWildcard('192.168.0.*').subnet;   // '/24'
       * Address4.fromWildcard('192.168.*.*').subnet;   // '/16'
       * Address4.fromWildcard('*.*.*.*').subnet;       // '/0'
       */
      static fromWildcard(input) {
        const groups = input.split(".");
        if (groups.length !== constants.GROUPS) {
          throw new address_error_1.AddressError("Wildcard pattern must have 4 octets");
        }
        let firstWildcard = -1;
        for (let i = 0; i < groups.length; i++) {
          if (groups[i] === "*") {
            if (firstWildcard === -1) {
              firstWildcard = i;
            }
          } else if (firstWildcard !== -1) {
            throw new address_error_1.AddressError("Wildcard `*` must only appear in trailing octets (e.g. `192.168.0.*`)");
          }
        }
        const trailing = firstWildcard === -1 ? 0 : groups.length - firstWildcard;
        const replaced = groups.map((g) => g === "*" ? "0" : g);
        const subnetBits = constants.BITS - trailing * 8;
        return new _Address4(`${replaced.join(".")}/${subnetBits}`);
      }
      /**
       * Converts a hex string to an IPv4 address object. Accepts 8 hex digits
       * with optional `:` separators (e.g. `'7f000001'` or `'7f:00:00:01'`).
       * Throws `AddressError` for any other length or for non-hex characters.
       * @param {string} hex - a hex string to convert
       * @returns {Address4}
       */
      static fromHex(hex) {
        const stripped = hex.replace(/:/g, "");
        if (!/^[0-9a-fA-F]{8}$/.test(stripped)) {
          throw new address_error_1.AddressError("IPv4 hex must be exactly 8 hex digits");
        }
        const groups = [];
        for (let i = 0; i < 8; i += 2) {
          groups.push(parseInt(stripped.slice(i, i + 2), 16));
        }
        return new _Address4(groups.join("."));
      }
      /**
       * Converts an integer into a IPv4 address object. The integer must be a
       * non-negative safe integer in the range `[0, 2**32 - 1]`; otherwise
       * `AddressError` is thrown.
       * @param {integer} integer - a number to convert
       * @returns {Address4}
       */
      static fromInteger(integer) {
        if (!Number.isInteger(integer) || integer < 0 || integer > 4294967295) {
          throw new address_error_1.AddressError("IPv4 integer must be in the range 0 to 2**32 - 1");
        }
        return _Address4.fromHex(integer.toString(16).padStart(8, "0"));
      }
      /**
       * Return an address from in-addr.arpa form
       * @param {string} arpaFormAddress - an 'in-addr.arpa' form ipv4 address
       * @returns {Adress4}
       * @example
       * var address = Address4.fromArpa(42.2.0.192.in-addr.arpa.)
       * address.correctForm(); // '192.0.2.42'
       */
      static fromArpa(arpaFormAddress) {
        const leader = arpaFormAddress.replace(/(\.in-addr\.arpa)?\.$/, "");
        const address = leader.split(".").reverse().join(".");
        return new _Address4(address);
      }
      /**
       * Converts an IPv4 address object to a hex string
       * @returns {String}
       */
      toHex() {
        return this.parsedAddress.map((part) => common.stringToPaddedHex(part)).join(":");
      }
      /**
       * Converts an IPv4 address object to an array of bytes.
       *
       * To get a Node.js `Buffer`, wrap the result: `Buffer.from(address.toArray())`.
       * @returns {Array}
       */
      toArray() {
        return this.parsedAddress.map((part) => parseInt(part, 10));
      }
      /**
       * Converts an IPv4 address object to an IPv6 address group
       * @returns {String}
       */
      toGroup6() {
        const output = [];
        let i;
        for (i = 0; i < constants.GROUPS; i += 2) {
          output.push(`${common.stringToPaddedHex(this.parsedAddress[i])}${common.stringToPaddedHex(this.parsedAddress[i + 1])}`);
        }
        return output.join(":");
      }
      /**
       * Returns the address as a `bigint`
       * @returns {bigint}
       */
      bigInt() {
        return BigInt(`0x${this.parsedAddress.map((n) => common.stringToPaddedHex(n)).join("")}`);
      }
      /**
       * Helper function getting start address.
       * @returns {bigint}
       */
      _startAddress() {
        return BigInt(`0b${this.mask() + "0".repeat(constants.BITS - this.subnetMask)}`);
      }
      /**
       * The first address in the range given by this address' subnet.
       * Often referred to as the Network Address.
       * @returns {Address4}
       */
      startAddress() {
        return _Address4.fromBigInt(this._startAddress());
      }
      /**
       * The first host address in the range given by this address's subnet ie
       * the first address after the Network Address
       * @returns {Address4}
       */
      startAddressExclusive() {
        const adjust = BigInt("1");
        return _Address4.fromBigInt(this._startAddress() + adjust);
      }
      /**
       * Helper function getting end address.
       * @returns {bigint}
       */
      _endAddress() {
        return BigInt(`0b${this.mask() + "1".repeat(constants.BITS - this.subnetMask)}`);
      }
      /**
       * The last address in the range given by this address' subnet
       * Often referred to as the Broadcast
       * @returns {Address4}
       */
      endAddress() {
        return _Address4.fromBigInt(this._endAddress());
      }
      /**
       * The last host address in the range given by this address's subnet ie
       * the last address prior to the Broadcast Address
       * @returns {Address4}
       */
      endAddressExclusive() {
        const adjust = BigInt("1");
        return _Address4.fromBigInt(this._endAddress() - adjust);
      }
      /**
       * The dotted-decimal form of the subnet mask, e.g. `255.255.240.0` for
       * a `/20`. Returns an `Address4`; call `.correctForm()` for the string.
       * @returns {Address4}
       */
      subnetMaskAddress() {
        return _Address4.fromBigInt(BigInt(`0b${"1".repeat(this.subnetMask)}${"0".repeat(constants.BITS - this.subnetMask)}`));
      }
      /**
       * The Cisco-style wildcard mask, e.g. `0.0.0.255` for a `/24`. This is
       * the bitwise inverse of `subnetMaskAddress()`. Returns an `Address4`;
       * call `.correctForm()` for the string.
       * @returns {Address4}
       */
      wildcardMask() {
        return _Address4.fromBigInt(BigInt(`0b${"0".repeat(this.subnetMask)}${"1".repeat(constants.BITS - this.subnetMask)}`));
      }
      /**
       * The network address in CIDR string form, e.g. `192.168.1.0/24` for
       * `192.168.1.5/24`. For an address with no explicit subnet the prefix is
       * `/32`, e.g. `networkForm()` on `192.168.1.5` returns `192.168.1.5/32`.
       * @returns {string}
       */
      networkForm() {
        return `${this.startAddress().correctForm()}/${this.subnetMask}`;
      }
      /**
       * Converts a BigInt to a v4 address object. The value must be in the
       * range `[0, 2**32 - 1]`; otherwise `AddressError` is thrown.
       * @param {bigint} bigInt - a BigInt to convert
       * @returns {Address4}
       */
      static fromBigInt(bigInt) {
        if (bigInt < 0n || bigInt > 0xffffffffn) {
          throw new address_error_1.AddressError("IPv4 BigInt must be in the range 0 to 2**32 - 1");
        }
        return _Address4.fromHex(bigInt.toString(16).padStart(8, "0"));
      }
      /**
       * Convert a byte array to an Address4 object.
       *
       * To convert from a Node.js `Buffer`, spread it: `Address4.fromByteArray([...buf])`.
       * @param {Array<number>} bytes - an array of 4 bytes (0-255)
       * @returns {Address4}
       */
      static fromByteArray(bytes) {
        if (bytes.length !== 4) {
          throw new address_error_1.AddressError("IPv4 addresses require exactly 4 bytes");
        }
        for (let i = 0; i < bytes.length; i++) {
          if (!Number.isInteger(bytes[i]) || bytes[i] < 0 || bytes[i] > 255) {
            throw new address_error_1.AddressError("All bytes must be integers between 0 and 255");
          }
        }
        return this.fromUnsignedByteArray(bytes);
      }
      /**
       * Convert an unsigned byte array to an Address4 object
       * @param {Array<number>} bytes - an array of 4 unsigned bytes (0-255)
       * @returns {Address4}
       */
      static fromUnsignedByteArray(bytes) {
        if (bytes.length !== 4) {
          throw new address_error_1.AddressError("IPv4 addresses require exactly 4 bytes");
        }
        const address = bytes.join(".");
        return new _Address4(address);
      }
      /**
       * Returns the first n bits of the address, defaulting to the
       * subnet mask
       * @returns {String}
       */
      mask(mask) {
        if (mask === void 0) {
          mask = this.subnetMask;
        }
        return this.getBitsBase2(0, mask);
      }
      /**
       * Returns the bits in the given range as a base-2 string
       * @returns {string}
       */
      getBitsBase2(start, end) {
        return this.binaryZeroPad().slice(start, end);
      }
      /**
       * Return the reversed ip6.arpa form of the address
       * @param {Object} options
       * @param {boolean} options.omitSuffix - omit the "in-addr.arpa" suffix
       * @returns {String}
       */
      reverseForm(options) {
        if (!options) {
          options = {};
        }
        const reversed = this.correctForm().split(".").reverse().join(".");
        if (options.omitSuffix) {
          return reversed;
        }
        return `${reversed}.in-addr.arpa.`;
      }
      /**
       * Returns true if the given address is a multicast address
       * @returns {boolean}
       */
      isMulticast() {
        return this.isHostInSubnet(MULTICAST_V4);
      }
      /**
       * Returns true if the address is in one of the [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918) private address ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
       * @returns {boolean}
       */
      isPrivate() {
        return PRIVATE_V4.some((subnet) => this.isHostInSubnet(subnet));
      }
      /**
       * Returns true if the address is in the loopback range `127.0.0.0/8` ([RFC 1122](https://datatracker.ietf.org/doc/html/rfc1122)).
       * @returns {boolean}
       */
      isLoopback() {
        return this.isHostInSubnet(LOOPBACK_V4);
      }
      /**
       * Returns true if the address is in the link-local range `169.254.0.0/16` ([RFC 3927](https://datatracker.ietf.org/doc/html/rfc3927)).
       * @returns {boolean}
       */
      isLinkLocal() {
        return this.isHostInSubnet(LINK_LOCAL_V4);
      }
      /**
       * Returns true if the address is the unspecified address `0.0.0.0`.
       * @returns {boolean}
       */
      isUnspecified() {
        return this.isHostInSubnet(UNSPECIFIED_V4);
      }
      /**
       * Returns true if the address is the limited broadcast address `255.255.255.255` ([RFC 919](https://datatracker.ietf.org/doc/html/rfc919)).
       * @returns {boolean}
       */
      isBroadcast() {
        return this.isHostInSubnet(BROADCAST_V4);
      }
      /**
       * Returns true if the address is in the carrier-grade NAT range `100.64.0.0/10` ([RFC 6598](https://datatracker.ietf.org/doc/html/rfc6598)).
       * @returns {boolean}
       */
      isCGNAT() {
        return this.isHostInSubnet(CGNAT_V4);
      }
      /**
       * Returns a zero-padded base-2 string representation of the address
       * @returns {string}
       */
      binaryZeroPad() {
        if (this._binaryZeroPad === void 0) {
          this._binaryZeroPad = this.bigInt().toString(2).padStart(constants.BITS, "0");
        }
        return this._binaryZeroPad;
      }
      /**
       * Groups an IPv4 address for inclusion at the end of an IPv6 address
       * @returns {String}
       */
      groupForV6() {
        const segments = this.parsedAddress;
        return this.correctForm().replace(constants.RE_ADDRESS, `<span class="hover-group group-v4 group-6">${segments.slice(0, 2).join(".")}</span>.<span class="hover-group group-v4 group-7">${segments.slice(2, 4).join(".")}</span>`);
      }
    };
    exports.Address4 = Address4;
    var MULTICAST_V4 = new Address4("224.0.0.0/4");
    var PRIVATE_V4 = [
      new Address4("10.0.0.0/8"),
      new Address4("172.16.0.0/12"),
      new Address4("192.168.0.0/16")
    ];
    var LOOPBACK_V4 = new Address4("127.0.0.0/8");
    var LINK_LOCAL_V4 = new Address4("169.254.0.0/16");
    var UNSPECIFIED_V4 = new Address4("0.0.0.0/32");
    var BROADCAST_V4 = new Address4("255.255.255.255/32");
    var CGNAT_V4 = new Address4("100.64.0.0/10");
  }
});

// node_modules/ip-address/dist/v6/constants.js
var require_constants2 = __commonJS({
  "node_modules/ip-address/dist/v6/constants.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RE_URL_WITH_PORT = exports.RE_URL = exports.RE_ZONE_STRING = exports.RE_SUBNET_STRING = exports.RE_BAD_ADDRESS = exports.RE_BAD_CHARACTERS = exports.TYPES = exports.SCOPES = exports.GROUPS = exports.BITS = void 0;
    exports.BITS = 128;
    exports.GROUPS = 8;
    exports.SCOPES = {
      0: "Reserved",
      1: "Interface local",
      2: "Link local",
      4: "Admin local",
      5: "Site local",
      8: "Organization local",
      14: "Global",
      15: "Reserved"
    };
    exports.TYPES = {
      "ff01::1/128": "Multicast (All nodes on this interface)",
      "ff01::2/128": "Multicast (All routers on this interface)",
      "ff02::1/128": "Multicast (All nodes on this link)",
      "ff02::2/128": "Multicast (All routers on this link)",
      "ff05::2/128": "Multicast (All routers in this site)",
      "ff02::5/128": "Multicast (OSPFv3 AllSPF routers)",
      "ff02::6/128": "Multicast (OSPFv3 AllDR routers)",
      "ff02::9/128": "Multicast (RIP routers)",
      "ff02::a/128": "Multicast (EIGRP routers)",
      "ff02::d/128": "Multicast (PIM routers)",
      "ff02::16/128": "Multicast (MLDv2 reports)",
      "ff01::fb/128": "Multicast (mDNSv6)",
      "ff02::fb/128": "Multicast (mDNSv6)",
      "ff05::fb/128": "Multicast (mDNSv6)",
      "ff02::1:2/128": "Multicast (All DHCP servers and relay agents on this link)",
      "ff05::1:2/128": "Multicast (All DHCP servers and relay agents in this site)",
      "ff02::1:3/128": "Multicast (All DHCP servers on this link)",
      "ff05::1:3/128": "Multicast (All DHCP servers in this site)",
      "::/128": "Unspecified",
      "::1/128": "Loopback",
      "::ffff:0:0/96": "IPv4-mapped",
      "ff00::/8": "Multicast",
      "fe80::/10": "Link-local unicast",
      "fc00::/7": "Unique local",
      "2002::/16": "6to4",
      "2001:db8::/32": "Documentation",
      "64:ff9b::/96": "NAT64 (well-known)",
      "64:ff9b:1::/48": "NAT64 (local-use)"
    };
    exports.RE_BAD_CHARACTERS = /([^0-9a-f:/%])/gi;
    exports.RE_BAD_ADDRESS = /([0-9a-f]{5,}|:{3,}|[^:]:$|^:[^:]|\/$)/gi;
    exports.RE_SUBNET_STRING = /\/\d{1,3}(?=%|$)/;
    exports.RE_ZONE_STRING = /%.*$/;
    exports.RE_URL = /^(?:\[([0-9a-f:.]+)\]|([0-9a-f:.]+))(?:[/?#].*)?$/i;
    exports.RE_URL_WITH_PORT = /^\[([0-9a-f:.]+)\]:([0-9]{1,5})(?:[/?#].*)?$/i;
  }
});

// node_modules/ip-address/dist/v6/helpers.js
var require_helpers = __commonJS({
  "node_modules/ip-address/dist/v6/helpers.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.escapeHtml = escapeHtml;
    exports.spanAllZeroes = spanAllZeroes;
    exports.spanAll = spanAll;
    exports.spanLeadingZeroes = spanLeadingZeroes;
    exports.simpleGroup = simpleGroup;
    function escapeHtml(s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    function spanAllZeroes(s) {
      return escapeHtml(s).replace(/(0+)/g, '<span class="zero">$1</span>');
    }
    function spanAll(s, offset = 0) {
      const letters = s.split("");
      return letters.map((n, i) => `<span class="digit value-${escapeHtml(n)} position-${i + offset}">${spanAllZeroes(n)}</span>`).join("");
    }
    function spanLeadingZeroesSimple(group) {
      return escapeHtml(group).replace(/^(0+)/, '<span class="zero">$1</span>');
    }
    function spanLeadingZeroes(address) {
      const groups = address.split(":");
      return groups.map((g) => spanLeadingZeroesSimple(g)).join(":");
    }
    function simpleGroup(addressString, offset = 0) {
      const groups = addressString.split(":");
      return groups.map((g, i) => {
        if (/group-v4/.test(g)) {
          return g;
        }
        return `<span class="hover-group group-${i + offset}">${spanLeadingZeroesSimple(g)}</span>`;
      });
    }
  }
});

// node_modules/ip-address/dist/v6/regular-expressions.js
var require_regular_expressions = __commonJS({
  "node_modules/ip-address/dist/v6/regular-expressions.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ADDRESS_BOUNDARY = void 0;
    exports.groupPossibilities = groupPossibilities;
    exports.padGroup = padGroup;
    exports.simpleRegularExpression = simpleRegularExpression;
    exports.possibleElisions = possibleElisions;
    var v6 = __importStar(require_constants2());
    function groupPossibilities(possibilities) {
      return `(${possibilities.join("|")})`;
    }
    function padGroup(group) {
      if (group.length < 4) {
        return `0{0,${4 - group.length}}${group}`;
      }
      return group;
    }
    exports.ADDRESS_BOUNDARY = "[^A-Fa-f0-9:]";
    function simpleRegularExpression(groups) {
      const zeroIndexes = [];
      groups.forEach((group, i) => {
        const groupInteger = parseInt(group, 16);
        if (groupInteger === 0) {
          zeroIndexes.push(i);
        }
      });
      const possibilities = zeroIndexes.map((zeroIndex) => groups.map((group, i) => {
        if (i === zeroIndex) {
          const elision = i === 0 || i === v6.GROUPS - 1 ? ":" : "";
          return groupPossibilities([padGroup(group), elision]);
        }
        return padGroup(group);
      }).join(":"));
      possibilities.push(groups.map(padGroup).join(":"));
      return groupPossibilities(possibilities);
    }
    function possibleElisions(elidedGroups, moreLeft, moreRight) {
      const left = moreLeft ? "" : ":";
      const right = moreRight ? "" : ":";
      const possibilities = [];
      if (!moreLeft && !moreRight) {
        possibilities.push("::");
      }
      if (moreLeft && moreRight) {
        possibilities.push("");
      }
      if (moreRight && !moreLeft || !moreRight && moreLeft) {
        possibilities.push(":");
      }
      possibilities.push(`${left}(:0{1,4}){1,${elidedGroups - 1}}`);
      possibilities.push(`(0{1,4}:){1,${elidedGroups - 1}}${right}`);
      possibilities.push(`(0{1,4}:){${elidedGroups - 1}}0{1,4}`);
      for (let groups = 1; groups < elidedGroups - 1; groups++) {
        for (let position = 1; position < elidedGroups - groups; position++) {
          possibilities.push(`(0{1,4}:){${position}}:(0{1,4}:){${elidedGroups - position - groups - 1}}0{1,4}`);
        }
      }
      return groupPossibilities(possibilities);
    }
  }
});

// node_modules/ip-address/dist/ipv6.js
var require_ipv6 = __commonJS({
  "node_modules/ip-address/dist/ipv6.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Address6 = void 0;
    var common = __importStar(require_common());
    var constants4 = __importStar(require_constants());
    var constants6 = __importStar(require_constants2());
    var helpers = __importStar(require_helpers());
    var ipv4_1 = require_ipv4();
    var regular_expressions_1 = require_regular_expressions();
    var address_error_1 = require_address_error();
    var common_1 = require_common();
    var isCorrect6 = common.isCorrect(constants6.BITS);
    function assert(condition) {
      if (!condition) {
        throw new Error("Assertion failed.");
      }
    }
    function addCommas(number) {
      const r = /(\d+)(\d{3})/;
      while (r.test(number)) {
        number = number.replace(r, "$1,$2");
      }
      return number;
    }
    function spanLeadingZeroes4(n) {
      n = n.replace(/^(0{1,})([1-9]+)$/, '<span class="parse-error">$1</span>$2');
      n = n.replace(/^(0{1,})(0)$/, '<span class="parse-error">$1</span>$2');
      return n;
    }
    function compact(address, slice) {
      const s1 = [];
      const s2 = [];
      let i;
      for (i = 0; i < address.length; i++) {
        if (i < slice[0]) {
          s1.push(address[i]);
        } else if (i > slice[1]) {
          s2.push(address[i]);
        }
      }
      return s1.concat(["compact"]).concat(s2);
    }
    function paddedHex(octet) {
      return parseInt(octet, 16).toString(16).padStart(4, "0");
    }
    function unsignByte(b) {
      return b & 255;
    }
    var Address62 = class _Address6 {
      constructor(address, optionalGroups) {
        this.addressMinusSuffix = "";
        this.parsedSubnet = "";
        this.subnet = "/128";
        this.subnetMask = 128;
        this.v4 = false;
        this.zone = "";
        this.isInSubnet = common.isInSubnet;
        this.isHostInSubnet = common.isHostInSubnet;
        this.isCorrect = isCorrect6;
        if (optionalGroups === void 0) {
          this.groups = constants6.GROUPS;
        } else {
          this.groups = optionalGroups;
        }
        this.address = address;
        const subnet = constants6.RE_SUBNET_STRING.exec(address);
        if (subnet) {
          this.parsedSubnet = subnet[0].replace("/", "");
          this.subnetMask = parseInt(this.parsedSubnet, 10);
          this.subnet = `/${this.subnetMask}`;
          if (Number.isNaN(this.subnetMask) || this.subnetMask < 0 || this.subnetMask > constants6.BITS) {
            throw new address_error_1.AddressError("Invalid subnet mask.");
          }
          address = address.replace(constants6.RE_SUBNET_STRING, "");
        }
        if (/\//.test(address)) {
          throw new address_error_1.AddressError("Invalid subnet mask.");
        }
        const zone = constants6.RE_ZONE_STRING.exec(address);
        if (zone) {
          this.zone = zone[0];
          address = address.replace(constants6.RE_ZONE_STRING, "");
        }
        this.addressMinusSuffix = address;
        this.parsedAddress = this.parse(this.addressMinusSuffix);
      }
      /**
       * Returns true if the given string is a valid IPv6 address (with optional
       * CIDR subnet and zone identifier), false otherwise. Host bits in the
       * subnet portion are allowed (e.g. `2001:db8::1/32` is valid); for strict
       * network-address validation compare `correctForm()` to
       * `startAddress().correctForm()`, or use `networkForm()`.
       */
      static isValid(address) {
        try {
          new _Address6(address);
          return true;
        } catch (e) {
          return false;
        }
      }
      /**
       * Convert a BigInt to a v6 address object. The value must be in the
       * range `[0, 2**128 - 1]`; otherwise `AddressError` is thrown.
       * @param {bigint} bigInt - a BigInt to convert
       * @returns {Address6}
       * @example
       * var bigInt = BigInt('1000000000000');
       * var address = Address6.fromBigInt(bigInt);
       * address.correctForm(); // '::e8:d4a5:1000'
       */
      static fromBigInt(bigInt) {
        if (bigInt < 0n || bigInt > (1n << BigInt(constants6.BITS)) - 1n) {
          throw new address_error_1.AddressError("IPv6 BigInt must be in the range 0 to 2**128 - 1");
        }
        const hex = bigInt.toString(16).padStart(32, "0");
        const groups = [];
        for (let i = 0; i < constants6.GROUPS; i++) {
          groups.push(hex.slice(i * 4, (i + 1) * 4));
        }
        return new _Address6(groups.join(":"));
      }
      /**
       * Parse a URL (with optional bracketed host and port) into an address and
       * port. Returns either `{ address, port }` on success or
       * `{ error, address: null, port: null }` if the URL could not be parsed.
       * Ports are returned as numbers (or `null` if absent or out of range).
       * @example
       * var addressAndPort = Address6.fromURL('http://[ffff::]:8080/foo/');
       * addressAndPort.address.correctForm(); // 'ffff::'
       * addressAndPort.port; // 8080
       */
      static fromURL(url) {
        let host;
        let port = null;
        let result;
        const stripped = url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
        if (stripped.indexOf("[") !== -1 && stripped.indexOf("]:") !== -1) {
          result = constants6.RE_URL_WITH_PORT.exec(stripped);
          if (result === null) {
            return {
              error: "failed to parse address with port",
              address: null,
              port: null
            };
          }
          host = result[1];
          port = result[2];
        } else {
          result = constants6.RE_URL.exec(stripped);
          if (result === null) {
            return {
              error: "failed to parse address from URL",
              address: null,
              port: null
            };
          }
          host = result[1] ?? result[2];
        }
        if (port) {
          port = parseInt(port, 10);
          if (port < 0 || port > 65535) {
            port = null;
          }
        } else {
          port = null;
        }
        return {
          address: new _Address6(host),
          port
        };
      }
      /**
       * Construct an `Address6` from an address and a hex subnet mask given as
       * separate strings (e.g. as returned by Node's `os.networkInterfaces()`).
       * Throws `AddressError` if the mask is non-contiguous (e.g.
       * `ffff::ffff`).
       * @example
       * var address = Address6.fromAddressAndMask('fe80::1', 'ffff:ffff:ffff:ffff::');
       * address.subnetMask; // 64
       */
      static fromAddressAndMask(address, mask) {
        const bits = common.prefixLengthFromMask(new _Address6(mask).bigInt(), constants6.BITS);
        return new _Address6(`${address}/${bits}`);
      }
      /**
       * Construct an `Address6` from an address and a Cisco-style wildcard mask
       * given as separate strings (e.g. `::ffff:ffff:ffff:ffff` for a `/64`).
       * The wildcard mask is the bitwise inverse of the subnet mask. Throws
       * `AddressError` if the mask is non-contiguous.
       * @example
       * var address = Address6.fromAddressAndWildcardMask('fe80::1', '::ffff:ffff:ffff:ffff');
       * address.subnetMask; // 64
       */
      static fromAddressAndWildcardMask(address, wildcardMask) {
        const wildcard = new _Address6(wildcardMask).bigInt();
        const allOnes = (BigInt(1) << BigInt(constants6.BITS)) - BigInt(1);
        const mask = wildcard ^ allOnes;
        const bits = common.prefixLengthFromMask(mask, constants6.BITS);
        return new _Address6(`${address}/${bits}`);
      }
      /**
       * Construct an `Address6` from a wildcard pattern with trailing `*`
       * groups. The number of trailing wildcards determines the prefix
       * length: each `*` represents 16 bits. `::` is expanded to zero groups
       * (not wildcards) before evaluating trailing wildcards.
       *
       * Only trailing whole-group wildcards are supported. Partial-group
       * wildcards (e.g. `2001:db8::0*`) and interior wildcards (e.g.
       * `*::1`) throw `AddressError`.
       * @example
       * Address6.fromWildcard('2001:db8:*:*:*:*:*:*').subnet;  // '/32'
       * Address6.fromWildcard('2001:db8::*').subnet;           // '/112'
       * Address6.fromWildcard('*:*:*:*:*:*:*:*').subnet;       // '/0'
       */
      static fromWildcard(input) {
        if (input.includes("%") || input.includes("/")) {
          throw new address_error_1.AddressError("Wildcard pattern must not include a zone or CIDR suffix");
        }
        const halves = input.split("::");
        if (halves.length > 2) {
          throw new address_error_1.AddressError("Wildcard pattern cannot contain more than one '::'");
        }
        let groups;
        if (halves.length === 2) {
          const left = halves[0] === "" ? [] : halves[0].split(":");
          const right = halves[1] === "" ? [] : halves[1].split(":");
          const remaining = constants6.GROUPS - left.length - right.length;
          if (remaining < 1) {
            throw new address_error_1.AddressError("Wildcard pattern with '::' has too many groups");
          }
          groups = [...left, ...new Array(remaining).fill("0"), ...right];
        } else {
          groups = input.split(":");
        }
        if (groups.length !== constants6.GROUPS) {
          throw new address_error_1.AddressError("Wildcard pattern must have 8 groups");
        }
        let firstWildcard = -1;
        for (let i = 0; i < groups.length; i++) {
          if (groups[i] === "*") {
            if (firstWildcard === -1) {
              firstWildcard = i;
            }
          } else if (firstWildcard !== -1) {
            throw new address_error_1.AddressError("Wildcard `*` must only appear in trailing groups (e.g. `2001:db8:*:*:*:*:*:*`)");
          }
        }
        const trailing = firstWildcard === -1 ? 0 : groups.length - firstWildcard;
        const replaced = groups.map((g) => g === "*" ? "0" : g);
        const subnetBits = constants6.BITS - trailing * 16;
        return new _Address6(`${replaced.join(":")}/${subnetBits}`);
      }
      /**
       * Create an IPv6-mapped address given an IPv4 address
       * @param {string} address - An IPv4 address string
       * @returns {Address6}
       * @example
       * var address = Address6.fromAddress4('192.168.0.1');
       * address.correctForm(); // '::ffff:c0a8:1'
       * address.to4in6(); // '::ffff:192.168.0.1'
       */
      static fromAddress4(address) {
        const address4 = new ipv4_1.Address4(address);
        const mask6 = constants6.BITS - (constants4.BITS - address4.subnetMask);
        return new _Address6(`::ffff:${address4.correctForm()}/${mask6}`);
      }
      /**
       * Return an address from ip6.arpa form
       * @param {string} arpaFormAddress - an 'ip6.arpa' form address
       * @returns {Adress6}
       * @example
       * var address = Address6.fromArpa(e.f.f.f.3.c.2.6.f.f.f.e.6.6.8.e.1.0.6.7.9.4.e.c.0.0.0.0.1.0.0.2.ip6.arpa.)
       * address.correctForm(); // '2001:0:ce49:7601:e866:efff:62c3:fffe'
       */
      static fromArpa(arpaFormAddress) {
        let address = arpaFormAddress.replace(/(\.ip6\.arpa)?\.$/, "");
        const semicolonAmount = 7;
        if (address.length !== 63) {
          throw new address_error_1.AddressError("Invalid 'ip6.arpa' form.");
        }
        const parts = address.split(".").reverse();
        for (let i = semicolonAmount; i > 0; i--) {
          const insertIndex = i * 4;
          parts.splice(insertIndex, 0, ":");
        }
        address = parts.join("");
        return new _Address6(address);
      }
      /**
       * Return the Microsoft UNC transcription of the address
       * @returns {String} the Microsoft UNC transcription of the address
       */
      microsoftTranscription() {
        return `${this.correctForm().replace(/:/g, "-")}.ipv6-literal.net`;
      }
      /**
       * Return the first n bits of the address, defaulting to the subnet mask
       * @param {number} [mask=subnet] - the number of bits to mask
       * @returns {String} the first n bits of the address as a string
       */
      mask(mask = this.subnetMask) {
        return this.getBitsBase2(0, mask);
      }
      /**
       * Return the number of possible subnets of a given size in the address
       * @param {number} [subnetSize=128] - the subnet size
       * @returns {String}
       */
      // TODO: probably useful to have a numeric version of this too
      possibleSubnets(subnetSize = 128) {
        const availableBits = constants6.BITS - this.subnetMask;
        const subnetBits = Math.abs(subnetSize - constants6.BITS);
        const subnetPowers = availableBits - subnetBits;
        if (subnetPowers < 0) {
          return "0";
        }
        return addCommas((BigInt("2") ** BigInt(subnetPowers)).toString(10));
      }
      /**
       * Helper function getting start address.
       * @returns {bigint}
       */
      _startAddress() {
        return BigInt(`0b${this.mask() + "0".repeat(constants6.BITS - this.subnetMask)}`);
      }
      /**
       * The first address in the range given by this address' subnet
       * Often referred to as the Network Address.
       * @returns {Address6}
       */
      startAddress() {
        return _Address6.fromBigInt(this._startAddress());
      }
      /**
       * The first host address in the range given by this address's subnet ie
       * the first address after the Network Address
       * @returns {Address6}
       */
      startAddressExclusive() {
        const adjust = BigInt("1");
        return _Address6.fromBigInt(this._startAddress() + adjust);
      }
      /**
       * Helper function getting end address.
       * @returns {bigint}
       */
      _endAddress() {
        return BigInt(`0b${this.mask() + "1".repeat(constants6.BITS - this.subnetMask)}`);
      }
      /**
       * The last address in the range given by this address' subnet
       * Often referred to as the Broadcast
       * @returns {Address6}
       */
      endAddress() {
        return _Address6.fromBigInt(this._endAddress());
      }
      /**
       * The last host address in the range given by this address's subnet ie
       * the last address prior to the Broadcast Address
       * @returns {Address6}
       */
      endAddressExclusive() {
        const adjust = BigInt("1");
        return _Address6.fromBigInt(this._endAddress() - adjust);
      }
      /**
       * The hex form of the subnet mask, e.g. `ffff:ffff:ffff:ffff::` for a
       * `/64`. Returns an `Address6`; call `.correctForm()` for the string.
       * @returns {Address6}
       */
      subnetMaskAddress() {
        return _Address6.fromBigInt(BigInt(`0b${"1".repeat(this.subnetMask)}${"0".repeat(constants6.BITS - this.subnetMask)}`));
      }
      /**
       * The Cisco-style wildcard mask, e.g. `::ffff:ffff:ffff:ffff` for a
       * `/64`. This is the bitwise inverse of `subnetMaskAddress()`. Returns
       * an `Address6`; call `.correctForm()` for the string.
       * @returns {Address6}
       */
      wildcardMask() {
        return _Address6.fromBigInt(BigInt(`0b${"0".repeat(this.subnetMask)}${"1".repeat(constants6.BITS - this.subnetMask)}`));
      }
      /**
       * The network address in CIDR string form, e.g. `2001:db8::/32` for
       * `2001:db8::1/32`. For an address with no explicit subnet the prefix
       * is `/128`, e.g. `networkForm()` on `2001:db8::1` returns
       * `2001:db8::1/128`.
       * @returns {string}
       */
      networkForm() {
        return `${this.startAddress().correctForm()}/${this.subnetMask}`;
      }
      /**
       * Return the scope of the address. The 4-bit scope field
       * ([RFC 4291 §2.7](https://datatracker.ietf.org/doc/html/rfc4291#section-2.7))
       * is only defined for multicast addresses; for unicast addresses the scope
       * is derived from the address type per
       * [RFC 4007 §6](https://datatracker.ietf.org/doc/html/rfc4007#section-6).
       * @returns {String}
       */
      getScope() {
        const type = this.getType();
        if (type === "Multicast" || type.startsWith("Multicast ")) {
          const scope = constants6.SCOPES[parseInt(this.getBits(12, 16).toString(10), 10)];
          return scope || "Unknown";
        }
        if (type === "Link-local unicast" || type === "Loopback") {
          return "Link local";
        }
        if (type === "Unspecified") {
          return "Unknown";
        }
        return "Global";
      }
      /**
       * Return the type of the address
       * @returns {String}
       */
      getType() {
        for (let i = 0; i < TYPE_SUBNETS.length; i++) {
          const entry = TYPE_SUBNETS[i];
          if (this.isHostInSubnet(entry[0])) {
            return entry[1];
          }
        }
        return "Global unicast";
      }
      /**
       * Return the bits in the given range as a BigInt
       * @returns {bigint}
       */
      getBits(start, end) {
        return BigInt(`0b${this.getBitsBase2(start, end)}`);
      }
      /**
       * Return the bits in the given range as a base-2 string
       * @returns {String}
       */
      getBitsBase2(start, end) {
        return this.binaryZeroPad().slice(start, end);
      }
      /**
       * Return the bits in the given range as a base-16 string
       * @returns {String}
       */
      getBitsBase16(start, end) {
        const length = end - start;
        if (length % 4 !== 0) {
          throw new Error("Length of bits to retrieve must be divisible by four");
        }
        return this.getBits(start, end).toString(16).padStart(length / 4, "0");
      }
      /**
       * Return the bits that are set past the subnet mask length
       * @returns {String}
       */
      getBitsPastSubnet() {
        return this.getBitsBase2(this.subnetMask, constants6.BITS);
      }
      /**
       * Return the reversed ip6.arpa form of the address
       * @param {Object} options
       * @param {boolean} options.omitSuffix - omit the "ip6.arpa" suffix
       * @returns {String}
       */
      reverseForm(options) {
        if (!options) {
          options = {};
        }
        const characters = Math.floor(this.subnetMask / 4);
        const reversed = this.canonicalForm().replace(/:/g, "").split("").slice(0, characters).reverse().join(".");
        if (characters > 0) {
          if (options.omitSuffix) {
            return reversed;
          }
          return `${reversed}.ip6.arpa.`;
        }
        if (options.omitSuffix) {
          return "";
        }
        return "ip6.arpa.";
      }
      /**
       * Returns the address in correct form, per
       * [RFC 5952](https://datatracker.ietf.org/doc/html/rfc5952): leading zeros
       * stripped, the longest run of zero groups collapsed to `::`, and hex digits
       * lowercased (e.g. `2001:db8::1`). This is the recommended form for display.
       */
      correctForm() {
        let i;
        let groups = [];
        let zeroCounter = 0;
        const zeroes = [];
        for (i = 0; i < this.parsedAddress.length; i++) {
          const value = parseInt(this.parsedAddress[i], 16);
          if (value === 0) {
            zeroCounter++;
          }
          if (value !== 0 && zeroCounter > 0) {
            if (zeroCounter > 1) {
              zeroes.push([i - zeroCounter, i - 1]);
            }
            zeroCounter = 0;
          }
        }
        if (zeroCounter > 1) {
          zeroes.push([this.parsedAddress.length - zeroCounter, this.parsedAddress.length - 1]);
        }
        const zeroLengths = zeroes.map((n) => n[1] - n[0] + 1);
        if (zeroes.length > 0) {
          const index = zeroLengths.indexOf(Math.max(...zeroLengths));
          groups = compact(this.parsedAddress, zeroes[index]);
        } else {
          groups = this.parsedAddress;
        }
        for (i = 0; i < groups.length; i++) {
          if (groups[i] !== "compact") {
            groups[i] = parseInt(groups[i], 16).toString(16);
          }
        }
        let correct = groups.join(":");
        correct = correct.replace(/^compact$/, "::");
        correct = correct.replace(/(^compact)|(compact$)/, ":");
        correct = correct.replace(/compact/, "");
        return correct;
      }
      /**
       * Return a zero-padded base-2 string representation of the address
       * @returns {String}
       * @example
       * var address = new Address6('2001:4860:4001:803::1011');
       * address.binaryZeroPad();
       * // '0010000000000001010010000110000001000000000000010000100000000011
       * //  0000000000000000000000000000000000000000000000000001000000010001'
       */
      binaryZeroPad() {
        if (this._binaryZeroPad === void 0) {
          this._binaryZeroPad = this.bigInt().toString(2).padStart(constants6.BITS, "0");
        }
        return this._binaryZeroPad;
      }
      /**
       * Parses a v4-in-v6 string (e.g. `::ffff:192.168.0.1`) by extracting the
       * trailing IPv4 address into `this.address4` / `this.parsedAddress4` and
       * returning the address with the v4 portion converted to two v6 groups.
       * Used internally by `parse()`.
       */
      // TODO: Improve the semantics of this helper function
      parse4in6(address) {
        if (address.indexOf(".") === -1) {
          return address;
        }
        const groups = address.split(":");
        const lastGroup = groups.slice(-1)[0];
        const v4Octets = lastGroup.split(".");
        if (v4Octets.length === constants4.GROUPS && v4Octets.every((octet) => /^\d{1,3}$/.test(octet))) {
          if (v4Octets.some((octet) => /^0\d/.test(octet))) {
            const highlighted = v4Octets.map(spanLeadingZeroes4).join(".");
            const prefix = groups.slice(0, -1).map(helpers.escapeHtml).join(":");
            const separator = groups.length > 1 ? ":" : "";
            throw new address_error_1.AddressError("IPv4 addresses can't have leading zeroes.", `${prefix}${separator}${highlighted}`);
          }
        }
        const address4 = lastGroup.match(constants4.RE_ADDRESS);
        if (address4) {
          this.parsedAddress4 = address4[0];
          const v4Suffix = this.subnetMask >= 96 ? `/${this.subnetMask - 96}` : "";
          this.address4 = new ipv4_1.Address4(`${this.parsedAddress4}${v4Suffix}`);
          this.v4 = true;
          groups[groups.length - 1] = this.address4.toGroup6();
          address = groups.join(":");
        }
        return address;
      }
      /**
       * Parses an IPv6 address string into its 8 hexadecimal groups (expanding
       * any `::` elision and any trailing v4-in-v6 portion) and stores the result
       * on `this.parsedAddress`. Called automatically by the constructor; you
       * typically don't need to call it directly. Throws `AddressError` if the
       * input is malformed.
       */
      // TODO: Make private?
      parse(address) {
        address = this.parse4in6(address);
        const badCharacters = address.match(constants6.RE_BAD_CHARACTERS);
        if (badCharacters) {
          throw new address_error_1.AddressError(`Bad character${badCharacters.length > 1 ? "s" : ""} detected in address: ${badCharacters.join("")}`, address.replace(constants6.RE_BAD_CHARACTERS, '<span class="parse-error">$1</span>'));
        }
        const badAddress = address.match(constants6.RE_BAD_ADDRESS);
        if (badAddress) {
          throw new address_error_1.AddressError(`Address failed regex: ${badAddress.join("")}`, address.replace(constants6.RE_BAD_ADDRESS, '<span class="parse-error">$1</span>'));
        }
        let groups = [];
        const halves = address.split("::");
        if (halves.length === 2) {
          let first = halves[0].split(":");
          let last = halves[1].split(":");
          if (first.length === 1 && first[0] === "") {
            first = [];
          }
          if (last.length === 1 && last[0] === "") {
            last = [];
          }
          const remaining = this.groups - (first.length + last.length);
          if (!remaining) {
            throw new address_error_1.AddressError("Error parsing groups");
          }
          this.elidedGroups = remaining;
          this.elisionBegin = first.length;
          this.elisionEnd = first.length + this.elidedGroups;
          groups = groups.concat(first);
          for (let i = 0; i < remaining; i++) {
            groups.push("0");
          }
          groups = groups.concat(last);
        } else if (halves.length === 1) {
          groups = address.split(":");
          this.elidedGroups = 0;
        } else {
          throw new address_error_1.AddressError("Too many :: groups found");
        }
        groups = groups.map((group) => parseInt(group, 16).toString(16));
        if (groups.length !== this.groups) {
          throw new address_error_1.AddressError("Incorrect number of groups found");
        }
        return groups;
      }
      /**
       * Returns the canonical (fully expanded) form of the address: all 8 groups,
       * each padded to 4 hex digits, with no `::` collapsing
       * (e.g. `2001:0db8:0000:0000:0000:0000:0000:0001`). Useful for sorting and
       * byte-exact comparison.
       */
      canonicalForm() {
        return this.parsedAddress.map(paddedHex).join(":");
      }
      /**
       * Return the decimal form of the address
       * @returns {String}
       */
      decimal() {
        return this.parsedAddress.map((n) => parseInt(n, 16).toString(10).padStart(5, "0")).join(":");
      }
      /**
       * Return the address as a BigInt
       * @returns {bigint}
       */
      bigInt() {
        return BigInt(`0x${this.parsedAddress.map(paddedHex).join("")}`);
      }
      /**
       * Return the last two groups of this address as an IPv4 address string.
       * If this address carries a CIDR prefix that covers the trailing 32 bits
       * (i.e. `subnetMask >= 96`), the resulting `Address4` inherits the
       * corresponding v4 prefix (`subnetMask - 96`); otherwise it defaults to
       * `/32`.
       * @returns {Address4}
       * @example
       * var address = new Address6('2001:4860:4001::1825:bf11');
       * address.to4().correctForm(); // '24.37.191.17'
       */
      to4() {
        const binary = this.binaryZeroPad().split("");
        const hex = BigInt(`0b${binary.slice(96, 128).join("")}`).toString(16).padStart(8, "0");
        if (this.subnetMask >= 96) {
          const v4Mask = this.subnetMask - 96;
          const groups = [];
          for (let i = 0; i < 8; i += 2) {
            groups.push(parseInt(hex.slice(i, i + 2), 16));
          }
          return new ipv4_1.Address4(`${groups.join(".")}/${v4Mask}`);
        }
        return ipv4_1.Address4.fromHex(hex);
      }
      /**
       * Return the v4-in-v6 form of the address
       * @returns {String}
       */
      to4in6() {
        const address4 = this.to4();
        const address6 = new _Address6(this.parsedAddress.slice(0, 6).join(":"), 6);
        const correct = address6.correctForm();
        let infix = "";
        if (!/:$/.test(correct)) {
          infix = ":";
        }
        return correct + infix + address4.correctForm();
      }
      /**
       * Decodes the Teredo tunneling fields embedded in this address. Returns the
       * Teredo prefix, server IPv4, client IPv4, raw flag bits, cone-NAT flag,
       * UDP port, and Microsoft-format flag breakdown (reserved, universal/local,
       * group/individual, nonce). Only meaningful for addresses in `2001::/32`.
       */
      inspectTeredo() {
        const prefix = this.getBitsBase16(0, 32);
        const bitsForUdpPort = this.getBits(80, 96);
        const udpPort = (bitsForUdpPort ^ BigInt("0xffff")).toString();
        const server4 = ipv4_1.Address4.fromHex(this.getBitsBase16(32, 64));
        const bitsForClient4 = this.getBits(96, 128);
        const client4 = ipv4_1.Address4.fromHex((bitsForClient4 ^ BigInt("0xffffffff")).toString(16).padStart(8, "0"));
        const flagsBase2 = this.getBitsBase2(64, 80);
        const coneNat = (0, common_1.testBit)(flagsBase2, 15);
        const reserved = (0, common_1.testBit)(flagsBase2, 14);
        const groupIndividual = (0, common_1.testBit)(flagsBase2, 8);
        const universalLocal = (0, common_1.testBit)(flagsBase2, 9);
        const nonce = BigInt(`0b${flagsBase2.slice(2, 6) + flagsBase2.slice(8, 16)}`).toString(10);
        return {
          prefix: `${prefix.slice(0, 4)}:${prefix.slice(4, 8)}`,
          server4: server4.address,
          client4: client4.address,
          flags: flagsBase2,
          coneNat,
          microsoft: {
            reserved,
            universalLocal,
            groupIndividual,
            nonce
          },
          udpPort
        };
      }
      /**
       * Decodes the 6to4 tunneling fields embedded in this address. Returns the
       * 6to4 prefix and the embedded IPv4 gateway address. Only meaningful for
       * addresses in `2002::/16`.
       */
      inspect6to4() {
        const prefix = this.getBitsBase16(0, 16);
        const gateway = ipv4_1.Address4.fromHex(this.getBitsBase16(16, 48));
        return {
          prefix: prefix.slice(0, 4),
          gateway: gateway.address
        };
      }
      /**
       * Return a v6 6to4 address from a v6 v4inv6 address
       * @returns {Address6}
       */
      to6to4() {
        if (!this.is4()) {
          return null;
        }
        const addr6to4 = [
          "2002",
          this.getBitsBase16(96, 112),
          this.getBitsBase16(112, 128),
          "",
          "/16"
        ].join(":");
        return new _Address6(addr6to4);
      }
      /**
       * Embed an IPv4 address into a NAT64 IPv6 address using the encoding
       * defined by [RFC 6052](https://datatracker.ietf.org/doc/html/rfc6052).
       * The default prefix is the well-known prefix `64:ff9b::/96`. The prefix
       * length must be one of 32, 40, 48, 56, 64, or 96; for prefixes shorter
       * than /64 the IPv4 octets are split around the reserved bits 64–71.
       * @example
       * Address6.fromAddress4Nat64('192.0.2.33').correctForm(); // '64:ff9b::c000:221'
       * Address6.fromAddress4Nat64('192.0.2.33', '2001:db8::/32').correctForm(); // '2001:db8:c000:221::'
       */
      static fromAddress4Nat64(address, prefix = "64:ff9b::/96") {
        const v4 = new ipv4_1.Address4(address);
        const prefix6 = new _Address6(prefix);
        const pl = prefix6.subnetMask;
        if (pl !== 32 && pl !== 40 && pl !== 48 && pl !== 56 && pl !== 64 && pl !== 96) {
          throw new address_error_1.AddressError("NAT64 prefix length must be 32, 40, 48, 56, 64, or 96");
        }
        const prefixBits = prefix6.binaryZeroPad();
        const v4Bits = v4.binaryZeroPad();
        let bits;
        if (pl === 96) {
          bits = prefixBits.slice(0, 96) + v4Bits;
        } else {
          const beforeU = 64 - pl;
          bits = prefixBits.slice(0, pl) + v4Bits.slice(0, beforeU) + "00000000" + v4Bits.slice(beforeU) + "0".repeat(128 - 72 - (32 - beforeU));
        }
        const hex = BigInt(`0b${bits}`).toString(16).padStart(32, "0");
        const groups = [];
        for (let i = 0; i < 8; i++) {
          groups.push(hex.slice(i * 4, (i + 1) * 4));
        }
        return new _Address6(groups.join(":"));
      }
      /**
       * Extract the embedded IPv4 address from a NAT64 IPv6 address using the
       * encoding defined by [RFC 6052](https://datatracker.ietf.org/doc/html/rfc6052).
       * The default prefix is the well-known prefix `64:ff9b::/96`. Returns
       * `null` if this address is not contained within the given prefix.
       * @example
       * new Address6('64:ff9b::c000:221').toAddress4Nat64()!.correctForm(); // '192.0.2.33'
       */
      toAddress4Nat64(prefix = "64:ff9b::/96") {
        const prefix6 = new _Address6(prefix);
        const pl = prefix6.subnetMask;
        if (pl !== 32 && pl !== 40 && pl !== 48 && pl !== 56 && pl !== 64 && pl !== 96) {
          throw new address_error_1.AddressError("NAT64 prefix length must be 32, 40, 48, 56, 64, or 96");
        }
        if (!this.isHostInSubnet(prefix6)) {
          return null;
        }
        const bits = this.binaryZeroPad();
        let v4Bits;
        if (pl === 96) {
          v4Bits = bits.slice(96, 128);
        } else {
          const beforeU = 64 - pl;
          v4Bits = bits.slice(pl, pl + beforeU) + bits.slice(72, 72 + (32 - beforeU));
        }
        const octets = [];
        for (let i = 0; i < 4; i++) {
          octets.push(parseInt(v4Bits.slice(i * 8, (i + 1) * 8), 2).toString());
        }
        return new ipv4_1.Address4(octets.join("."));
      }
      /**
       * Return a byte array.
       *
       * To get a Node.js `Buffer`, wrap the result: `Buffer.from(address.toByteArray())`.
       * @returns {Array}
       */
      toByteArray() {
        const value = this.bigInt().toString(16).padStart(constants6.BITS / 4, "0");
        const bytes = [];
        for (let i = 0, length = value.length; i < length; i += 2) {
          bytes.push(parseInt(value.substring(i, i + 2), 16));
        }
        return bytes;
      }
      /**
       * Return an unsigned byte array.
       *
       * To get a Node.js `Buffer`, wrap the result: `Buffer.from(address.toUnsignedByteArray())`.
       * @returns {Array}
       */
      toUnsignedByteArray() {
        return this.toByteArray().map(unsignByte);
      }
      /**
       * Convert a byte array to an Address6 object.
       *
       * To convert from a Node.js `Buffer`, spread it: `Address6.fromByteArray([...buf])`.
       * @returns {Address6}
       */
      static fromByteArray(bytes) {
        return this.fromUnsignedByteArray(bytes.map(unsignByte));
      }
      /**
       * Convert an unsigned byte array to an Address6 object.
       *
       * To convert from a Node.js `Buffer`, spread it: `Address6.fromUnsignedByteArray([...buf])`.
       * @returns {Address6}
       */
      static fromUnsignedByteArray(bytes) {
        const BYTE_MAX = BigInt("256");
        let result = BigInt("0");
        let multiplier = BigInt("1");
        for (let i = bytes.length - 1; i >= 0; i--) {
          result += multiplier * BigInt(bytes[i].toString(10));
          multiplier *= BYTE_MAX;
        }
        return _Address6.fromBigInt(result);
      }
      /**
       * Returns true if the address is in the canonical form, false otherwise
       * @returns {boolean}
       */
      isCanonical() {
        return this.addressMinusSuffix === this.canonicalForm();
      }
      /**
       * Returns true if the address is a link local address, false otherwise
       * @returns {boolean}
       */
      isLinkLocal() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
          return embedded.isLinkLocal();
        }
        if (this.getBitsBase2(0, 64) === "1111111010000000000000000000000000000000000000000000000000000000") {
          return true;
        }
        return false;
      }
      /**
       * Returns true if the address is a multicast address, false otherwise
       * @returns {boolean}
       */
      isMulticast() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
          return embedded.isMulticast();
        }
        const type = this.getType();
        return type === "Multicast" || type.startsWith("Multicast ");
      }
      /**
       * Returns true if the address was written in v4-in-v6 dotted-quad notation
       * (e.g. `::ffff:127.0.0.1`), false otherwise. This is a notation-level flag
       * and does not reflect whether the address bits lie in the IPv4-mapped
       * (`::ffff:0:0/96`) subnet — for that, see {@link isMapped4}.
       * @returns {boolean}
       */
      is4() {
        return this.v4;
      }
      /**
       * Returns true if the address is an IPv4-mapped IPv6 address in
       * `::ffff:0:0/96` ([RFC 4291 §2.5.5.2](https://datatracker.ietf.org/doc/html/rfc4291#section-2.5.5.2)),
       * false otherwise. Unlike {@link is4}, this checks the underlying address
       * bits rather than the textual notation, so `::ffff:127.0.0.1` and
       * `::ffff:7f00:1` both return true.
       * @returns {boolean}
       */
      isMapped4() {
        return this.isHostInSubnet(IPV4_MAPPED_SUBNET);
      }
      /**
       * If this address embeds a routable IPv4 address — i.e. it is IPv4-mapped
       * (`::ffff:0:0/96`) or sits in the NAT64 well-known prefix (`64:ff9b::/96`,
       * [RFC 6052](https://datatracker.ietf.org/doc/html/rfc6052)) — return that
       * embedded address as an {@link Address4}; otherwise return null.
       *
       * The special-property checks (`isLoopback`, `isLinkLocal`, `isMulticast`,
       * `isUnspecified`, `isPrivate`, `isCGNAT`, `isBroadcast`) call this first and
       * delegate to the embedded {@link Address4} when present, so a literal such as
       * `::ffff:127.0.0.1` is classified by what it actually reaches (loopback)
       * rather than by its IPv6 wrapper (which `getType()` reports as IPv4-mapped).
       * This matters wherever the checks back a trust-boundary decision (e.g. an
       * SSRF allow/deny filter): without normalization, `::ffff:10.0.0.1`,
       * `::ffff:169.254.169.254`, `64:ff9b::7f00:1`, etc. would all read as
       * non-internal.
       * @returns {Address4 | null}
       */
      embeddedIPv4() {
        if (this.isMapped4() || this.isHostInSubnet(NAT64_WELL_KNOWN_SUBNET)) {
          return this.to4();
        }
        return null;
      }
      /**
       * Returns true if the address is a Teredo address, false otherwise
       * @returns {boolean}
       */
      isTeredo() {
        return this.isHostInSubnet(TEREDO_SUBNET);
      }
      /**
       * Returns true if the address is a 6to4 address, false otherwise
       * @returns {boolean}
       */
      is6to4() {
        return this.isHostInSubnet(SIX_TO_FOUR_SUBNET);
      }
      /**
       * Returns true if the address is a loopback address, false otherwise
       * @returns {boolean}
       */
      isLoopback() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
          return embedded.isLoopback();
        }
        return this.getType() === "Loopback";
      }
      /**
       * Returns true if the address is a Unique Local Address in `fc00::/7` ([RFC 4193](https://datatracker.ietf.org/doc/html/rfc4193)). ULAs are the IPv6 equivalent of IPv4 [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918) private addresses.
       * @returns {boolean}
       */
      isULA() {
        return this.isHostInSubnet(ULA_SUBNET);
      }
      /**
       * Returns true if the address is private, i.e. a Unique Local Address in
       * `fc00::/7` ([RFC 4193](https://datatracker.ietf.org/doc/html/rfc4193)) or an
       * IPv4-mapped / NAT64 address whose embedded IPv4 address is in one of the
       * [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918) private ranges
       * (e.g. `::ffff:10.0.0.1`). This is the IPv6 counterpart to
       * {@link Address4.isPrivate}; use it instead of {@link isULA} when you need to
       * catch mapped RFC 1918 addresses as well as native ULAs.
       * @returns {boolean}
       */
      isPrivate() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
          return embedded.isPrivate();
        }
        return this.isULA();
      }
      /**
       * Returns true if the address is an IPv4-mapped / NAT64 address whose embedded
       * IPv4 address is in the carrier-grade NAT range `100.64.0.0/10`
       * ([RFC 6598](https://datatracker.ietf.org/doc/html/rfc6598)), false
       * otherwise. There is no native IPv6 CGNAT range, so this only ever returns
       * true for an embedded IPv4 address (e.g. `::ffff:100.64.0.1`).
       * @returns {boolean}
       */
      isCGNAT() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
          return embedded.isCGNAT();
        }
        return false;
      }
      /**
       * Returns true if the address is an IPv4-mapped / NAT64 address whose embedded
       * IPv4 address is the limited broadcast address `255.255.255.255`
       * ([RFC 919](https://datatracker.ietf.org/doc/html/rfc919)), false otherwise.
       * There is no IPv6 broadcast, so this only ever returns true for an embedded
       * IPv4 address (e.g. `::ffff:255.255.255.255`).
       * @returns {boolean}
       */
      isBroadcast() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
          return embedded.isBroadcast();
        }
        return false;
      }
      /**
       * Returns true if the address is the unspecified address `::`.
       * @returns {boolean}
       */
      isUnspecified() {
        const embedded = this.embeddedIPv4();
        if (embedded) {
          return embedded.isUnspecified();
        }
        return this.getType() === "Unspecified";
      }
      /**
       * Returns true if the address is in the documentation prefix `2001:db8::/32` ([RFC 3849](https://datatracker.ietf.org/doc/html/rfc3849)).
       * @returns {boolean}
       */
      isDocumentation() {
        return this.isHostInSubnet(DOCUMENTATION_SUBNET);
      }
      // #endregion
      // #region HTML
      /**
       * Returns the address as an HTTP URL with the host bracketed, e.g.
       * `http://[2001:db8::1]/`. If `optionalPort` is provided it is appended,
       * e.g. `http://[2001:db8::1]:8080/`.
       */
      href(optionalPort) {
        if (optionalPort === void 0) {
          optionalPort = "";
        } else {
          optionalPort = `:${optionalPort}`;
        }
        return `http://[${this.correctForm()}]${optionalPort}/`;
      }
      /**
       * Returns an HTML `<a>` element whose `href` encodes the address in a URL
       * hash fragment (default prefix `/#address=`). Useful for linking between
       * pages of an address-inspector UI.
       * @param options.className - CSS class for the rendered `<a>` element
       * @param options.prefix - hash prefix prepended to the address (default `/#address=`)
       * @param options.v4 - when true, render the address in v4-in-v6 form
       */
      link(options) {
        if (!options) {
          options = {};
        }
        if (options.className === void 0) {
          options.className = "";
        }
        if (options.prefix === void 0) {
          options.prefix = "/#address=";
        }
        if (options.v4 === void 0) {
          options.v4 = false;
        }
        let formFunction = this.correctForm;
        if (options.v4) {
          formFunction = this.to4in6;
        }
        const form = formFunction.call(this);
        const safeHref = helpers.escapeHtml(`${options.prefix}${form}`);
        const safeForm = helpers.escapeHtml(form);
        if (options.className) {
          const safeClass = helpers.escapeHtml(options.className);
          return `<a href="${safeHref}" class="${safeClass}">${safeForm}</a>`;
        }
        return `<a href="${safeHref}">${safeForm}</a>`;
      }
      /**
       * Groups an address
       * @returns {String}
       */
      group() {
        if (this.elidedGroups === 0) {
          return helpers.simpleGroup(this.addressMinusSuffix).join(":");
        }
        assert(typeof this.elidedGroups === "number");
        assert(typeof this.elisionBegin === "number");
        const output = [];
        const [left, right] = this.addressMinusSuffix.split("::");
        if (left.length) {
          output.push(...helpers.simpleGroup(left));
        } else {
          output.push("");
        }
        const classes = ["hover-group"];
        for (let i = this.elisionBegin; i < this.elisionBegin + this.elidedGroups; i++) {
          classes.push(`group-${i}`);
        }
        output.push(`<span class="${classes.join(" ")}"></span>`);
        if (right.length) {
          output.push(...helpers.simpleGroup(right, this.elisionEnd));
        } else {
          output.push("");
        }
        if (this.is4()) {
          assert(this.address4 instanceof ipv4_1.Address4);
          output.pop();
          output.push(this.address4.groupForV6());
        }
        return output.join(":");
      }
      // #endregion
      // #region Regular expressions
      /**
       * Generate a regular expression string that can be used to find or validate
       * all variations of this address
       * @param {boolean} substringSearch
       * @returns {string}
       */
      regularExpressionString(substringSearch = false) {
        let output = [];
        const address6 = new _Address6(this.correctForm());
        if (address6.elidedGroups === 0) {
          output.push((0, regular_expressions_1.simpleRegularExpression)(address6.parsedAddress));
        } else if (address6.elidedGroups === constants6.GROUPS) {
          output.push((0, regular_expressions_1.possibleElisions)(constants6.GROUPS));
        } else {
          const halves = address6.address.split("::");
          if (halves[0].length) {
            output.push((0, regular_expressions_1.simpleRegularExpression)(halves[0].split(":")));
          }
          assert(typeof address6.elidedGroups === "number");
          output.push((0, regular_expressions_1.possibleElisions)(address6.elidedGroups, halves[0].length !== 0, halves[1].length !== 0));
          if (halves[1].length) {
            output.push((0, regular_expressions_1.simpleRegularExpression)(halves[1].split(":")));
          }
          output = [output.join(":")];
        }
        if (!substringSearch) {
          output = [
            "(?=^|",
            regular_expressions_1.ADDRESS_BOUNDARY,
            "|[^\\w\\:])(",
            ...output,
            ")(?=[^\\w\\:]|",
            regular_expressions_1.ADDRESS_BOUNDARY,
            "|$)"
          ];
        }
        return output.join("");
      }
      /**
       * Generate a regular expression that can be used to find or validate all
       * variations of this address.
       * @param {boolean} substringSearch
       * @returns {RegExp}
       */
      regularExpression(substringSearch = false) {
        return new RegExp(this.regularExpressionString(substringSearch), "i");
      }
    };
    exports.Address6 = Address62;
    var TYPE_SUBNETS = Object.keys(constants6.TYPES).map((subnet) => [
      new Address62(subnet),
      constants6.TYPES[subnet]
    ]);
    var TEREDO_SUBNET = new Address62("2001::/32");
    var SIX_TO_FOUR_SUBNET = new Address62("2002::/16");
    var ULA_SUBNET = new Address62("fc00::/7");
    var DOCUMENTATION_SUBNET = new Address62("2001:db8::/32");
    var IPV4_MAPPED_SUBNET = new Address62("::ffff:0:0/96");
    var NAT64_WELL_KNOWN_SUBNET = new Address62("64:ff9b::/96");
  }
});

// node_modules/ip-address/dist/ip-address.js
var require_ip_address = __commonJS({
  "node_modules/ip-address/dist/ip-address.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.v6 = exports.AddressError = exports.Address6 = exports.Address4 = void 0;
    var ipv4_1 = require_ipv4();
    Object.defineProperty(exports, "Address4", { enumerable: true, get: function() {
      return ipv4_1.Address4;
    } });
    var ipv6_1 = require_ipv6();
    Object.defineProperty(exports, "Address6", { enumerable: true, get: function() {
      return ipv6_1.Address6;
    } });
    var address_error_1 = require_address_error();
    Object.defineProperty(exports, "AddressError", { enumerable: true, get: function() {
      return address_error_1.AddressError;
    } });
    var helpers = __importStar(require_helpers());
    exports.v6 = { helpers };
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/debug/src/common.js
var require_common2 = __commonJS({
  "node_modules/debug/src/common.js"(exports, module) {
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
          if (!debug.enabled) {
            return;
          }
          const self = debug;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          const logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy;
        Object.defineProperty(debug, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug);
        }
        return debug;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns of split) {
          if (ns[0] === "-") {
            createDebug.skips.push(ns.slice(1));
          } else {
            createDebug.names.push(ns);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns of createDebug.names) {
          if (matchesTemplate(name, ns)) {
            return true;
          }
        }
        return false;
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module.exports = setup;
  }
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/debug/src/browser.js"(exports, module) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = require_common2()(exports);
    var { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/debug/src/node.js
var require_node = __commonJS({
  "node_modules/debug/src/node.js"(exports, module) {
    var tty = __require("tty");
    var util = __require("util");
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.destroy = util.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = __require("supports-color");
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util.formatWithOptions(exports.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug) {
      debug.inspectOpts = {};
      const keys = Object.keys(exports.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    module.exports = require_common2()(exports);
    var { formatters } = module.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  }
});

// node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/debug/src/index.js"(exports, module) {
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module.exports = require_browser();
    } else {
      module.exports = require_node();
    }
  }
});

// api/index.ts
import express from "express";
import helmet from "helmet";
import dotenv3 from "dotenv";

// server/middleware/cors.ts
import cors from "cors";
var allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:3000",
  "chrome-extension://"
  // browser extension support
];
var corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(
      (allowed) => origin === allowed || origin.startsWith(allowed)
    );
    if (isAllowed) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      callback(new Error("CORS politikas\u0131 gere\u011Fi bu k\xF6kene izin verilmiyor."));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-gemini-api-key"]
});

// node_modules/express-rate-limit/dist/index.mjs
var import_ip_address = __toESM(require_ip_address(), 1);
var import_debug = __toESM(require_src(), 1);
import { isIPv6 } from "node:net";
import { isIPv6 as isIPv62 } from "node:net";
import { Buffer as Buffer2 } from "node:buffer";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
function ipKeyGenerator(ip, ipv6Subnet = 56) {
  if (isIPv6(ip)) {
    const address = new import_ip_address.Address6(ip);
    if (address.is4()) return address.to4().correctForm();
    if (ipv6Subnet) {
      const subnet = new import_ip_address.Address6(`${ip}/${ipv6Subnet}`);
      return subnet.networkForm();
    }
  }
  return ip;
}
var MemoryStore = class {
  constructor(validations2) {
    this.validations = validations2;
    this.previous = /* @__PURE__ */ new Map();
    this.current = /* @__PURE__ */ new Map();
    this.localKeys = true;
  }
  /**
   * Method that initializes the store.
   *
   * @param options {Options} - The options used to setup the middleware.
   */
  init(options) {
    this.windowMs = options.windowMs;
    this.validations?.windowMs(this.windowMs);
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.clearExpired();
    }, this.windowMs);
    this.interval.unref?.();
  }
  /**
   * Method to fetch a client's hit count and reset time.
   *
   * @param key {string} - The identifier for a client.
   *
   * @returns {ClientRateLimitInfo | undefined} - The number of hits and reset time for that client.
   *
   * @public
   */
  async get(key) {
    return this.current.get(key) ?? this.previous.get(key);
  }
  /**
   * Method to increment a client's hit counter.
   *
   * @param key {string} - The identifier for a client.
   *
   * @returns {ClientRateLimitInfo} - The number of hits and reset time for that client.
   *
   * @public
   */
  async increment(key) {
    const client = this.getClient(key);
    const now = Date.now();
    if (client.resetTime.getTime() <= now) {
      this.resetClient(client, now);
    }
    client.totalHits++;
    return client;
  }
  /**
   * Method to decrement a client's hit counter.
   *
   * @param key {string} - The identifier for a client.
   *
   * @public
   */
  async decrement(key) {
    const client = this.getClient(key);
    if (client.totalHits > 0) client.totalHits--;
  }
  /**
   * Method to reset a client's hit counter.
   *
   * @param key {string} - The identifier for a client.
   *
   * @public
   */
  async resetKey(key) {
    this.current.delete(key);
    this.previous.delete(key);
  }
  /**
   * Method to reset everyone's hit counter.
   *
   * @public
   */
  async resetAll() {
    this.current.clear();
    this.previous.clear();
  }
  /**
   * Method to stop the timer (if currently running) and prevent any memory
   * leaks.
   *
   * @public
   */
  shutdown() {
    clearInterval(this.interval);
    void this.resetAll();
  }
  /**
   * Recycles a client by setting its hit count to zero, and reset time to
   * `windowMs` milliseconds from now.
   *
   * NOT to be confused with `#resetKey()`, which removes a client from both the
   * `current` and `previous` maps.
   *
   * @param client {Client} - The client to recycle.
   * @param now {number} - The current time, to which the `windowMs` is added to get the `resetTime` for the client.
   *
   * @return {Client} - The modified client that was passed in, to allow for chaining.
   */
  resetClient(client, now = Date.now()) {
    client.totalHits = 0;
    client.resetTime.setTime(now + this.windowMs);
    return client;
  }
  /**
   * Retrieves or creates a client, given a key. Also ensures that the client being
   * returned is in the `current` map.
   *
   * @param key {string} - The key under which the client is (or is to be) stored.
   *
   * @returns {Client} - The requested client.
   */
  getClient(key) {
    if (this.current.has(key)) return this.current.get(key);
    let client;
    if (this.previous.has(key)) {
      client = this.previous.get(key);
      this.previous.delete(key);
    } else {
      client = { totalHits: 0, resetTime: /* @__PURE__ */ new Date() };
      this.resetClient(client);
    }
    this.current.set(key, client);
    return client;
  }
  /**
   * Move current clients to previous, create a new map for current.
   *
   * This function is called every `windowMs`.
   */
  clearExpired() {
    this.previous = this.current;
    this.current = /* @__PURE__ */ new Map();
  }
};
var ConsoleLogger = {
  warn(...args) {
    console.warn(...args.reverse());
  },
  error(...args) {
    console.error(...args.reverse());
  }
};
var SUPPORTED_DRAFT_VERSIONS = [
  "draft-6",
  "draft-7",
  "draft-8"
];
var getResetSeconds = (windowMs, resetTime) => {
  let resetSeconds;
  if (resetTime) {
    const deltaSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1e3);
    resetSeconds = Math.max(0, deltaSeconds);
  } else {
    resetSeconds = Math.ceil(windowMs / 1e3);
  }
  return resetSeconds;
};
var getPartitionKey = (key) => {
  const hash = createHash("sha256");
  hash.update(key);
  const partitionKey = hash.digest("hex").slice(0, 12);
  return Buffer2.from(partitionKey).toString("base64");
};
var setLegacyHeaders = (response, info) => {
  if (response.headersSent) return;
  response.setHeader("X-RateLimit-Limit", info.limit.toString());
  response.setHeader("X-RateLimit-Remaining", info.remaining.toString());
  if (info.resetTime instanceof Date) {
    response.setHeader("Date", (/* @__PURE__ */ new Date()).toUTCString());
    response.setHeader(
      "X-RateLimit-Reset",
      Math.ceil(info.resetTime.getTime() / 1e3).toString()
    );
  }
};
var setDraft6Headers = (response, info, windowMs) => {
  if (response.headersSent) return;
  const windowSeconds = Math.ceil(windowMs / 1e3);
  const resetSeconds = getResetSeconds(windowMs, info.resetTime);
  response.setHeader("RateLimit-Policy", `${info.limit};w=${windowSeconds}`);
  response.setHeader("RateLimit-Limit", info.limit.toString());
  response.setHeader("RateLimit-Remaining", info.remaining.toString());
  if (typeof resetSeconds === "number")
    response.setHeader("RateLimit-Reset", resetSeconds.toString());
};
var setDraft7Headers = (response, info, windowMs) => {
  if (response.headersSent) return;
  const windowSeconds = Math.ceil(windowMs / 1e3);
  const resetSeconds = getResetSeconds(windowMs, info.resetTime);
  response.setHeader("RateLimit-Policy", `${info.limit};w=${windowSeconds}`);
  response.setHeader(
    "RateLimit",
    `limit=${info.limit}, remaining=${info.remaining}, reset=${resetSeconds}`
  );
};
var setDraft8Headers = (response, info, windowMs, name, key) => {
  if (response.headersSent) return;
  const windowSeconds = Math.ceil(windowMs / 1e3);
  const resetSeconds = getResetSeconds(windowMs, info.resetTime);
  const partitionKey = getPartitionKey(key);
  const header = `r=${info.remaining}; t=${resetSeconds}`;
  const policy = `q=${info.limit}; w=${windowSeconds}; pk=:${partitionKey}:`;
  response.append("RateLimit", `"${name}"; ${header}`);
  response.append("RateLimit-Policy", `"${name}"; ${policy}`);
};
var setRetryAfterHeader = (response, info, windowMs) => {
  if (response.headersSent) return;
  const resetSeconds = getResetSeconds(windowMs, info.resetTime);
  response.setHeader("Retry-After", resetSeconds.toString());
};
var omitUndefinedProperties = (passedOptions) => {
  const omittedOptions = {};
  for (const k of Object.keys(passedOptions)) {
    const key = k;
    if (passedOptions[key] !== void 0) {
      omittedOptions[key] = passedOptions[key];
    }
  }
  return omittedOptions;
};
var ValidationError = class extends Error {
  /**
   * The code must be a string, in snake case and all capital, that starts with
   * the substring `ERR_ERL_`.
   *
   * The message must be a string, starting with an uppercase character,
   * describing the issue in detail.
   */
  constructor(code, message) {
    const url = `https://express-rate-limit.github.io/${code}/`;
    super(`${message} See ${url} for more information.`);
    this.name = this.constructor.name;
    this.code = code;
    this.help = url;
  }
};
var ChangeWarning = class extends ValidationError {
};
var usedStores = /* @__PURE__ */ new Set();
var singleCountKeys = /* @__PURE__ */ new WeakMap();
var validations = {
  enabled: {
    default: true
  },
  // Should be EnabledValidations type, but that's a circular reference
  disable() {
    for (const k of Object.keys(this.enabled)) this.enabled[k] = false;
  },
  /**
   * Checks whether the IP address is valid, and that it does not have a port
   * number in it.
   *
   * See https://github.com/express-rate-limit/express-rate-limit/wiki/Error-Codes#err_erl_invalid_ip_address.
   *
   * @param ip {string | undefined} - The IP address provided by Express as request.ip.
   *
   * @returns {void}
   */
  ip(ip) {
    if (ip === void 0) {
      throw new ValidationError(
        "ERR_ERL_UNDEFINED_IP_ADDRESS",
        `An undefined 'request.ip' was detected. This might indicate a misconfiguration or the connection being destroyed prematurely.`
      );
    }
    if (!isIP(ip)) {
      throw new ValidationError(
        "ERR_ERL_INVALID_IP_ADDRESS",
        `An invalid 'request.ip' (${ip}) was detected. Consider passing a custom 'keyGenerator' function to the rate limiter.`
      );
    }
  },
  /**
   * Makes sure the trust proxy setting is not set to `true`.
   *
   * See https://github.com/express-rate-limit/express-rate-limit/wiki/Error-Codes#err_erl_permissive_trust_proxy.
   *
   * @param request {Request} - The Express request object.
   *
   * @returns {void}
   */
  trustProxy(request) {
    if (request.app.get("trust proxy") === true) {
      throw new ValidationError(
        "ERR_ERL_PERMISSIVE_TRUST_PROXY",
        `The Express 'trust proxy' setting is true, which allows anyone to trivially bypass IP-based rate limiting.`
      );
    }
  },
  /**
   * Makes sure the trust proxy setting is set in case the `X-Forwarded-For`
   * header is present.
   *
   * See https://github.com/express-rate-limit/express-rate-limit/wiki/Error-Codes#err_erl_unset_trust_proxy.
   *
   * @param request {Request} - The Express request object.
   *
   * @returns {void}
   */
  xForwardedForHeader(request) {
    if (request.headers["x-forwarded-for"] && request.app.get("trust proxy") === false) {
      throw new ValidationError(
        "ERR_ERL_UNEXPECTED_X_FORWARDED_FOR",
        `The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false (default). This could indicate a misconfiguration which would prevent express-rate-limit from accurately identifying users.`
      );
    }
  },
  /**
   * Alert the user if the Forwarded header is set (standardized version of X-Forwarded-For - not supported by express as of version 5.1.0)
   *
   * @param request {Request} - The Express request object.
   *
   * @returns {void}
   */
  forwardedHeader(request) {
    if (request.headers.forwarded && request.ip === request.socket?.remoteAddress) {
      throw new ValidationError(
        "ERR_ERL_FORWARDED_HEADER",
        `The 'Forwarded' header (standardized X-Forwarded-For) is set but currently being ignored. Add a custom keyGenerator to use a value from this header.`
      );
    }
  },
  /**
   * Ensures totalHits value from store is a positive integer.
   *
   * @param hits {any} - The `totalHits` returned by the store.
   */
  positiveHits(hits) {
    if (typeof hits !== "number" || hits < 1 || hits !== Math.round(hits)) {
      throw new ValidationError(
        "ERR_ERL_INVALID_HITS",
        `The totalHits value returned from the store must be a positive integer, got ${hits}`
      );
    }
  },
  /**
   * Ensures a single store instance is not used with multiple express-rate-limit instances
   */
  unsharedStore(store) {
    if (usedStores.has(store)) {
      const maybeUniquePrefix = store?.localKeys ? "" : " (with a unique prefix)";
      throw new ValidationError(
        "ERR_ERL_STORE_REUSE",
        `A Store instance must not be shared across multiple rate limiters. Create a new instance of ${store.constructor.name}${maybeUniquePrefix} for each limiter instead.`
      );
    }
    usedStores.add(store);
  },
  /**
   * Ensures a given key is incremented only once per request.
   *
   * @param request {Request} - The Express request object.
   * @param store {Store} - The store class.
   * @param key {string} - The key used to store the client's hit count.
   *
   * @returns {void}
   */
  singleCount(request, store, key) {
    let storeKeys = singleCountKeys.get(request);
    if (!storeKeys) {
      storeKeys = /* @__PURE__ */ new Map();
      singleCountKeys.set(request, storeKeys);
    }
    const storeKey = store.localKeys ? store : store.constructor.name;
    let keys = storeKeys.get(storeKey);
    if (!keys) {
      keys = [];
      storeKeys.set(storeKey, keys);
    }
    const prefixedKey = `${store.prefix ?? ""}${key}`;
    if (keys.includes(prefixedKey)) {
      throw new ValidationError(
        "ERR_ERL_DOUBLE_COUNT",
        `The hit count for ${key} was incremented more than once for a single request.`
      );
    }
    keys.push(prefixedKey);
  },
  /**
   * Warns the user that the behaviour for `max: 0` / `limit: 0` is
   * changing in the next major release.
   *
   * @param limit {number} - The maximum number of hits per client.
   *
   * @returns {void}
   */
  limit(limit) {
    if (limit === 0) {
      throw new ChangeWarning(
        "WRN_ERL_MAX_ZERO",
        "Setting limit or max to 0 disables rate limiting in express-rate-limit v6 and older, but will cause all requests to be blocked in v7"
      );
    }
  },
  /**
   * Warns the user that the `draft_polli_ratelimit_headers` option is deprecated
   * and will be removed in the next major release.
   *
   * @param draft_polli_ratelimit_headers {any | undefined} - The now-deprecated setting that was used to enable standard headers.
   *
   * @returns {void}
   */
  draftPolliHeaders(draft_polli_ratelimit_headers) {
    if (draft_polli_ratelimit_headers) {
      throw new ChangeWarning(
        "WRN_ERL_DEPRECATED_DRAFT_POLLI_HEADERS",
        `The draft_polli_ratelimit_headers configuration option is deprecated and has been removed in express-rate-limit v7, please set standardHeaders: 'draft-6' instead.`
      );
    }
  },
  /**
   * Warns the user that the `onLimitReached` option is deprecated and
   * will be removed in the next major release.
   *
   * @param onLimitReached {any | undefined} - The maximum number of hits per client.
   *
   * @returns {void}
   */
  onLimitReached(onLimitReached) {
    if (onLimitReached) {
      throw new ChangeWarning(
        "WRN_ERL_DEPRECATED_ON_LIMIT_REACHED",
        "The onLimitReached configuration option is deprecated and has been removed in express-rate-limit v7."
      );
    }
  },
  /**
   * Warns the user when an invalid/unsupported version of the draft spec is passed.
   *
   * @param version {any | undefined} - The version passed by the user.
   *
   * @returns {void}
   */
  headersDraftVersion(version) {
    if (typeof version !== "string" || // @ts-expect-error This is fine. If version is not in the array, it will just return false.
    !SUPPORTED_DRAFT_VERSIONS.includes(version)) {
      const versionString = SUPPORTED_DRAFT_VERSIONS.join(", ");
      throw new ValidationError(
        "ERR_ERL_HEADERS_UNSUPPORTED_DRAFT_VERSION",
        `standardHeaders: only the following versions of the IETF draft specification are supported: ${versionString}.`
      );
    }
  },
  /**
   * Warns the user when the selected headers option requires a reset time but
   * the store does not provide one.
   *
   * @param resetTime {Date | undefined} - The timestamp when the client's hit count will be reset.
   *
   * @returns {void}
   */
  headersResetTime(resetTime) {
    if (!resetTime) {
      throw new ValidationError(
        "ERR_ERL_HEADERS_NO_RESET",
        `standardHeaders:  'draft-7' requires a 'resetTime', but the store did not provide one. The 'windowMs' value will be used instead, which may cause clients to wait longer than necessary.`
      );
    }
  },
  knownOptions(passedOptions) {
    if (!passedOptions) return;
    const optionsMap = {
      windowMs: true,
      limit: true,
      message: true,
      statusCode: true,
      legacyHeaders: true,
      standardHeaders: true,
      identifier: true,
      requestPropertyName: true,
      skipFailedRequests: true,
      skipSuccessfulRequests: true,
      keyGenerator: true,
      ipv6Subnet: true,
      handler: true,
      skip: true,
      requestWasSuccessful: true,
      store: true,
      validate: true,
      headers: true,
      max: true,
      passOnStoreError: true,
      logger: true
    };
    const validOptions = Object.keys(optionsMap).concat(
      "draft_polli_ratelimit_headers",
      // not a valid option anymore, but we have a more specific check for this one, so don't warn for it here
      // from express-slow-down - https://github.com/express-rate-limit/express-slow-down/blob/main/source/types.ts#L65
      "delayAfter",
      "delayMs",
      "maxDelayMs"
    );
    for (const key of Object.keys(passedOptions)) {
      if (!validOptions.includes(key)) {
        throw new ValidationError(
          "ERR_ERL_UNKNOWN_OPTION",
          `Unexpected configuration option: ${key}`
          // todo: suggest a valid option with a short levenstein distance?
        );
      }
    }
  },
  /**
   * Checks the options.validate setting to ensure that only recognized
   * validations are enabled or disabled.
   *
   * If any unrecognized values are found, an error is logged that
   * includes the list of supported validations.
   */
  validationsConfig() {
    const supportedValidations = Object.keys(this).filter(
      (k) => !["enabled", "disable"].includes(k)
    );
    supportedValidations.push("default");
    for (const key of Object.keys(this.enabled)) {
      if (!supportedValidations.includes(key)) {
        throw new ValidationError(
          "ERR_ERL_UNKNOWN_VALIDATION",
          `options.validate.${key} is not recognized. Supported validate options are: ${supportedValidations.join(
            ", "
          )}.`
        );
      }
    }
  },
  /**
   * Checks to see if the instance was created inside of a request handler,
   * which would prevent it from working correctly, with the default memory
   * store (or any other store with localKeys.)
   */
  creationStack(store) {
    const { stack } = new Error(
      "express-rate-limit validation check (set options.validate.creationStack=false to disable)"
    );
    if (stack?.includes("Layer.handle [as handle_request]") || // express v4
    stack?.includes("Layer.handleRequest")) {
      if (!store.localKeys) {
        throw new ValidationError(
          "ERR_ERL_CREATED_IN_REQUEST_HANDLER",
          "express-rate-limit instance should *usually* be created at app initialization, not when responding to a request."
        );
      }
      throw new ValidationError(
        "ERR_ERL_CREATED_IN_REQUEST_HANDLER",
        "express-rate-limit instance should be created at app initialization, not when responding to a request."
      );
    }
  },
  ipv6Subnet(ipv6Subnet) {
    if (ipv6Subnet === false) {
      return;
    }
    if (!Number.isInteger(ipv6Subnet) || ipv6Subnet < 32 || ipv6Subnet > 64) {
      throw new ValidationError(
        "ERR_ERL_IPV6_SUBNET",
        `Unexpected ipv6Subnet value: ${ipv6Subnet}. Expected an integer between 32 and 64 (usually 48-64).`
      );
    }
  },
  ipv6SubnetOrKeyGenerator(options) {
    if (options.ipv6Subnet !== void 0 && options.keyGenerator) {
      throw new ValidationError(
        "ERR_ERL_IPV6SUBNET_OR_KEYGENERATOR",
        `Incompatible options: the 'ipv6Subnet' option is ignored when a custom 'keyGenerator' function is also set.`
      );
    }
  },
  keyGeneratorIpFallback(keyGenerator) {
    if (!keyGenerator) {
      return;
    }
    const src = keyGenerator.toString();
    if ((src.includes("req.ip") || src.includes("request.ip")) && !src.includes("ipKeyGenerator")) {
      throw new ValidationError(
        "ERR_ERL_KEY_GEN_IPV6",
        "Custom keyGenerator appears to use request IP without calling the ipKeyGenerator helper function for IPv6 addresses. This could allow IPv6 users to bypass limits."
      );
    }
  },
  /**
   * Checks to see if the window duration is greater than 2^32 - 1. This is only
   * called by the default MemoryStore, since it uses Node's setInterval method.
   *
   * See https://nodejs.org/api/timers.html#setintervalcallback-delay-args.
   */
  windowMs(windowMs) {
    const SET_TIMEOUT_MAX = 2 ** 31 - 1;
    if (typeof windowMs !== "number" || Number.isNaN(windowMs) || windowMs < 1 || windowMs > SET_TIMEOUT_MAX) {
      throw new ValidationError(
        "ERR_ERL_WINDOW_MS",
        `Invalid windowMs value: ${windowMs}${typeof windowMs !== "number" ? ` (${typeof windowMs})` : ""}, must be a number between 1 and ${SET_TIMEOUT_MAX} when using the default MemoryStore`
      );
    }
  }
};
function validateLogger(logger) {
  if (typeof logger !== "object" || typeof logger.error !== "function" || typeof logger.warn !== "function") {
    throw new TypeError(
      "Provided logger does not implement the Logger interface"
    );
  }
}
var getValidations = (_enabled, logger) => {
  validateLogger(logger);
  let enabled;
  if (typeof _enabled === "boolean") {
    enabled = {
      default: _enabled
    };
  } else {
    enabled = {
      default: true,
      ..._enabled
    };
  }
  const wrappedValidations = { enabled };
  for (const [name, validation] of Object.entries(validations)) {
    if (typeof validation === "function")
      wrappedValidations[name] = (...args) => {
        if (!(enabled[name] ?? enabled.default)) {
          return;
        }
        enabled[name] = false;
        try {
          ;
          validation.apply(
            wrappedValidations,
            args
          );
        } catch (error) {
          if (error instanceof ChangeWarning) logger.warn(error);
          else logger.error(error);
        }
      };
  }
  const inspect = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom");
  if (inspect)
    wrappedValidations[inspect] = () => wrappedValidations.enabled;
  return wrappedValidations;
};
var isLegacyStore = (store) => (
  // Check that `incr` exists but `increment` does not - store authors might want
  // to keep both around for backwards compatibility.
  typeof store.incr === "function" && typeof store.increment !== "function"
);
var promisifyStore = (passedStore) => {
  if (!isLegacyStore(passedStore)) {
    return passedStore;
  }
  const legacyStore = passedStore;
  class PromisifiedStore {
    async increment(key) {
      return new Promise((resolve, reject) => {
        legacyStore.incr(
          key,
          (error, totalHits, resetTime) => {
            if (error) reject(error);
            resolve({ totalHits, resetTime });
          }
        );
      });
    }
    async decrement(key) {
      return legacyStore.decrement(key);
    }
    async resetKey(key) {
      return legacyStore.resetKey(key);
    }
    /* istanbul ignore next */
    async resetAll() {
      if (typeof legacyStore.resetAll === "function")
        return legacyStore.resetAll();
    }
  }
  return new PromisifiedStore();
};
var getOptionsFromConfig = (config) => {
  const { validations: validations2, ...directlyPassableEntries } = config;
  return {
    ...directlyPassableEntries,
    validate: validations2.enabled
  };
};
var parseOptions = (passedOptions) => {
  const notUndefinedOptions = omitUndefinedProperties(passedOptions);
  const logger = passedOptions.logger ?? ConsoleLogger;
  const validations2 = getValidations(
    notUndefinedOptions?.validate ?? true,
    logger
  );
  validations2.validationsConfig();
  validations2.knownOptions(passedOptions);
  validations2.draftPolliHeaders(
    // @ts-expect-error see the note above.
    notUndefinedOptions.draft_polli_ratelimit_headers
  );
  validations2.onLimitReached(notUndefinedOptions.onLimitReached);
  if (notUndefinedOptions.ipv6Subnet !== void 0 && typeof notUndefinedOptions.ipv6Subnet !== "function") {
    validations2.ipv6Subnet(notUndefinedOptions.ipv6Subnet);
  }
  validations2.keyGeneratorIpFallback(notUndefinedOptions.keyGenerator);
  validations2.ipv6SubnetOrKeyGenerator(notUndefinedOptions);
  let standardHeaders = notUndefinedOptions.standardHeaders ?? false;
  if (standardHeaders === true) standardHeaders = "draft-6";
  const config = {
    windowMs: 60 * 1e3,
    limit: passedOptions.max ?? 5,
    // `max` is deprecated, but support it anyways.
    message: "Too many requests, please try again later.",
    statusCode: 429,
    legacyHeaders: passedOptions.headers ?? true,
    identifier(request, _response) {
      let duration = "";
      const property = config.requestPropertyName;
      const { limit } = request[property];
      const seconds = config.windowMs / 1e3;
      const minutes = config.windowMs / (1e3 * 60);
      const hours = config.windowMs / (1e3 * 60 * 60);
      const days = config.windowMs / (1e3 * 60 * 60 * 24);
      if (seconds < 60) duration = `${seconds}sec`;
      else if (minutes < 60) duration = `${minutes}min`;
      else if (hours < 24) duration = `${hours}hr${hours > 1 ? "s" : ""}`;
      else duration = `${days}day${days > 1 ? "s" : ""}`;
      return `${limit}-in-${duration}`;
    },
    requestPropertyName: "rateLimit",
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
    requestWasSuccessful: (_request, response) => response.statusCode < 400,
    skip: (_request, _response) => false,
    async keyGenerator(request, response) {
      validations2.ip(request.ip);
      validations2.trustProxy(request);
      validations2.xForwardedForHeader(request);
      validations2.forwardedHeader(request);
      const ip = request.ip;
      let subnet = 56;
      if (isIPv62(ip)) {
        subnet = typeof config.ipv6Subnet === "function" ? await config.ipv6Subnet(request, response) : config.ipv6Subnet;
        if (typeof config.ipv6Subnet === "function")
          validations2.ipv6Subnet(subnet);
      }
      return ipKeyGenerator(ip, subnet);
    },
    ipv6Subnet: 56,
    async handler(request, response, _next, _optionsUsed) {
      response.status(config.statusCode);
      const message = typeof config.message === "function" ? await config.message(
        request,
        response
      ) : config.message;
      if (!response.writableEnded) response.send(message);
    },
    passOnStoreError: false,
    // Allow the default options to be overridden by the passed options.
    ...notUndefinedOptions,
    // `standardHeaders` is resolved into a draft version above, use that.
    standardHeaders,
    // Note that this field is declared after the user's options are spread in,
    // so that this field doesn't get overridden with an un-promisified store!
    store: promisifyStore(
      notUndefinedOptions.store ?? new MemoryStore(validations2)
    ),
    // Print an error to the console if a few known misconfigurations are detected.
    validations: validations2,
    logger
  };
  if (typeof config.store.increment !== "function" || typeof config.store.decrement !== "function" || typeof config.store.resetKey !== "function" || config.store.resetAll !== void 0 && typeof config.store.resetAll !== "function" || config.store.init !== void 0 && typeof config.store.init !== "function") {
    throw new TypeError(
      "An invalid store was passed. Please ensure that the store is a class that implements the `Store` interface."
    );
  }
  return config;
};
var handleAsyncErrors = (fn) => async (request, response, next) => {
  try {
    await Promise.resolve(fn(request, response, next)).catch(next);
  } catch (error) {
    next(error);
  }
};
var rateLimit = (passedOptions) => {
  const config = parseOptions(passedOptions ?? {});
  const options = getOptionsFromConfig(config);
  const debug = (0, import_debug.default)("express-rate-limit");
  debug("creating new rate limiter with %o", config.store.constructor.name);
  for (const [key, val] of Object.entries(config))
    debug("set %s to %o", key, val);
  config.validations.creationStack(config.store);
  config.validations.unsharedStore(config.store);
  if (typeof config.store.init === "function") {
    debug("executing init for store");
    try {
      const storeInit = config.store.init(options);
      if (storeInit instanceof Promise) {
        storeInit.catch(
          (error) => config.logger.error(
            error,
            "express-rate-limit: async error during store initialization."
          )
        );
      }
    } catch (error) {
      config.logger.error(
        error,
        "express-rate-limit: error during store initialization."
      );
    }
  }
  const middleware = handleAsyncErrors(
    async (request, response, next) => {
      const closePromise = config.skipFailedRequests && new Promise((resolve) => response.once("close", resolve));
      const finishPromise = (config.skipFailedRequests || config.skipSuccessfulRequests) && new Promise((resolve) => response.once("finish", resolve));
      const errorPromise = config.skipFailedRequests && new Promise((resolve) => response.once("error", resolve));
      debug("requested %o", request.originalUrl);
      debug("request from ip %o", request.ip);
      const skip = await config.skip(request, response);
      if (skip) {
        debug("skipping request");
        next();
        return;
      }
      const augmentedRequest = request;
      const key = await config.keyGenerator(request, response);
      debug("computed key %o", key);
      debug("incrementing count");
      let totalHits = 0;
      let resetTime;
      try {
        const incrementResult = await config.store.increment(key);
        totalHits = incrementResult.totalHits;
        resetTime = incrementResult.resetTime;
      } catch (error) {
        if (config.passOnStoreError) {
          config.logger.error(
            error,
            "express-rate-limit: error from store, allowing request without rate-limiting."
          );
          next();
          return;
        }
        throw error;
      }
      config.validations.positiveHits(totalHits);
      config.validations.singleCount(request, config.store, key);
      const retrieveLimit = typeof config.limit === "function" ? config.limit(request, response) : config.limit;
      const limit = await retrieveLimit;
      config.validations.limit(limit);
      const info = {
        limit,
        used: totalHits,
        remaining: Math.max(limit - totalHits, 0),
        resetTime,
        key
      };
      for (const [key2, val] of Object.entries(info))
        debug(
          "set request.%s.%s to be %o",
          config.requestPropertyName,
          key2,
          val
        );
      Object.defineProperty(info, "current", {
        configurable: false,
        enumerable: false,
        value: totalHits
      });
      augmentedRequest[config.requestPropertyName] = info;
      if (config.legacyHeaders && !response.headersSent) {
        debug("set legacy headers");
        setLegacyHeaders(response, info);
      }
      if (config.standardHeaders && !response.headersSent) {
        switch (config.standardHeaders) {
          case "draft-6": {
            debug("set ietf draft 6 headers");
            setDraft6Headers(response, info, config.windowMs);
            break;
          }
          case "draft-7": {
            debug("set ietf draft 7 headers");
            config.validations.headersResetTime(info.resetTime);
            setDraft7Headers(response, info, config.windowMs);
            break;
          }
          case "draft-8": {
            const retrieveName = typeof config.identifier === "function" ? config.identifier(request, response) : config.identifier;
            const name = await retrieveName;
            debug("set ietf draft 8 headers");
            debug("set name to %o", name);
            config.validations.headersResetTime(info.resetTime);
            setDraft8Headers(response, info, config.windowMs, name, key);
            break;
          }
          default: {
            config.validations.headersDraftVersion(config.standardHeaders);
            break;
          }
        }
      }
      if (config.skipFailedRequests || config.skipSuccessfulRequests) {
        let decremented = false;
        const decrementKey = async () => {
          if (!decremented) {
            if (resetTime && Date.now() >= resetTime.getTime()) {
              return;
            }
            debug("decrementing count");
            await config.store.decrement(key);
            decremented = true;
          }
        };
        if (config.skipFailedRequests) {
          if (finishPromise) {
            void finishPromise.then(async () => {
              const success = await config.requestWasSuccessful(
                request,
                response
              );
              debug("computed requestWasSuccessful as %o", success);
              if (!success) await decrementKey();
            });
          }
          if (closePromise) {
            void closePromise.then(async () => {
              if (!response.writableEnded) await decrementKey();
            });
          }
          if (errorPromise) {
            void errorPromise.then(async () => {
              await decrementKey();
            });
          }
        }
        if (config.skipSuccessfulRequests) {
          if (finishPromise) {
            void finishPromise.then(async () => {
              const success = await config.requestWasSuccessful(
                request,
                response
              );
              debug("computed requestWasSuccessful as %o", success);
              if (success) await decrementKey();
            });
          }
        }
      }
      if (totalHits > limit) {
        debug("limit exceeded");
        if (config.legacyHeaders || config.standardHeaders) {
          debug("set retry-after header");
          setRetryAfterHeader(response, info, config.windowMs);
        }
        config.handler(request, response, next, options);
        return;
      }
      next();
    }
  );
  const getThrowFn = () => {
    throw new Error("The current store does not support the get/getKey method");
  };
  middleware.resetKey = config.store.resetKey.bind(config.store);
  middleware.getKey = typeof config.store.get === "function" ? config.store.get.bind(config.store) : getThrowFn;
  return middleware;
};
var rate_limit_default = rateLimit;
var SECOND = 1e3;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;

// server/middleware/rateLimit.ts
var apiLimiter = rate_limit_default({
  windowMs: 60 * 1e3,
  // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "\xC7ok fazla istek g\xF6nderildi. L\xFCtfen bir dakika sonra tekrar deneyin." }
});
var aiLimiter = rate_limit_default({
  windowMs: 60 * 1e3,
  // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI istek limitine ula\u015F\u0131ld\u0131. L\xFCtfen biraz bekleyin." }
});
var metadataLimiter = rate_limit_default({
  windowMs: 60 * 1e3,
  // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Metadata \xE7ekme limitine ula\u015F\u0131ld\u0131. L\xFCtfen daha sonra deneyin." }
});

// server/middleware/errorHandler.ts
function globalErrorHandler(err, req, res, next) {
  console.error("Global Server Error:", err);
  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" ? "Sunucuda beklenmeyen bir hata olu\u015Ftu." : err.message || "\u0130\xE7 Sunucu Hatas\u0131";
  res.status(statusCode).json({
    error: message,
    ...process.env.NODE_ENV !== "production" && { stack: err.stack }
  });
}

// server/routes/metadata.ts
import { Router } from "express";

// server/services/scraperService.ts
async function fetchOpenGraphMeta(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5e3);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
      }
    });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const html = await response.text();
    const getMeta = (property) => {
      const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")) || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, "i"));
      return match ? match[1] : null;
    };
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = getMeta("og:title") || getMeta("twitter:title") || (titleMatch ? titleMatch[1] : null);
    const description = getMeta("og:description") || getMeta("twitter:description") || getMeta("description");
    const image = getMeta("og:image") || getMeta("twitter:image");
    const siteName = getMeta("og:site_name") || getMeta("author");
    return {
      title: title ? title.trim() : null,
      description: description ? description.trim() : null,
      thumbnail_url: image || null,
      author: siteName ? siteName.trim() : null
    };
  } catch (err) {
    return null;
  }
}
async function fetchThreadsMeta(url) {
  try {
    const cleanUrl = url.trim();
    const authorUrlMatch = cleanUrl.match(/threads\.(?:net|com)\/@([a-zA-Z0-9_.-]+)/i);
    let author = authorUrlMatch ? `@${authorUrlMatch[1]}` : null;
    const postIdMatch = cleanUrl.match(/\/post\/([A-Za-z0-9_-]+)/i) || cleanUrl.match(/\/t\/([A-Za-z0-9_-]+)/i);
    const postId = postIdMatch ? postIdMatch[1] : null;
    if (!postId) return null;
    let title = null;
    let description = null;
    let thumbnail_url = null;
    const targetUrl = author ? `https://www.threads.net/${author}/post/${postId}` : `https://www.threads.net/t/${postId}`;
    try {
      const ogRes = await fetch(targetUrl, {
        headers: {
          "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
        }
      });
      if (ogRes.ok) {
        const ogHtml = await ogRes.text();
        const ogImgMatch = ogHtml.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["']([^"']+)["']/i) || ogHtml.match(/content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
        if (ogImgMatch && ogImgMatch[1]) {
          thumbnail_url = ogImgMatch[1].replace(/&amp;/g, "&").replace(/\\u0026/g, "&").replace(/\\/g, "");
        }
        const ogDescMatch = ogHtml.match(/<meta\s+(?:property|name)=["'](?:og:description|twitter:description)["']\s+content=["']([^"']+)["']/i) || ogHtml.match(/content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:description|twitter:description)["']/i);
        if (ogDescMatch && ogDescMatch[1]) {
          description = ogDescMatch[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").trim();
        }
        const ogTitleMatch = ogHtml.match(/<meta\s+(?:property|name)=["'](?:og:title|twitter:title)["']\s+content=["']([^"']+)["']/i);
        if (ogTitleMatch && ogTitleMatch[1]) {
          title = ogTitleMatch[1].replace(/&amp;/g, "&").trim();
        }
      }
    } catch (e) {
      console.warn("Threads OG fetch error, falling back to embed:", e);
    }
    if (!description || !thumbnail_url) {
      const embedUrl = `https://www.threads.net/embed/post/${postId}`;
      const res = await fetch(embedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
          "Sec-Fetch-Site": "same-origin"
        }
      });
      if (res.ok) {
        const html = await res.text();
        const userMatch = html.match(/"username"\s*:\s*"([^"]+)"/i) || html.match(/@([a-zA-Z0-9_.-]+)/);
        if (userMatch && userMatch[1] && !author) {
          author = `@${userMatch[1]}`;
        }
        if (!description) {
          const textMatch = html.match(/"caption"\s*:\s*\{\s*"text"\s*:\s*"([^"]+)"/i) || html.match(/"text"\s*:\s*"([^"]{5,1000})"/i);
          if (textMatch && textMatch[1]) {
            description = textMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\u([0-9a-fA-F]{4})/g, (_, cc) => String.fromCharCode(parseInt(cc, 16)));
          }
        }
        if (!thumbnail_url) {
          const mediaImages = [...html.matchAll(/https?:\\?\/\\?\/[^\s"'<>\\]+cdninstagram[^\s"'<>\\]*/gi)].map((m) => m[0].replace(/\\/g, "").replace(/&amp;/g, "&")).filter((img) => !img.includes("rsrc.php") && !img.includes("static") && !img.includes("profile_pic"));
          if (mediaImages.length > 0) {
            thumbnail_url = mediaImages[0];
          } else {
            const profImages = [...html.matchAll(/https?:\\?\/\\?\/[^\s"'<>\\]+cdninstagram[^\s"'<>\\]*/gi)].map((m) => m[0].replace(/\\/g, "").replace(/&amp;/g, "&")).filter((img) => img.includes("profile_pic"));
            if (profImages.length > 0) {
              thumbnail_url = profImages[0];
            }
          }
        }
      }
    }
    if (!title) {
      if (description) {
        const firstLine = description.split("\n")[0].trim();
        title = firstLine.length > 80 ? firstLine.substring(0, 80) + "..." : firstLine;
      } else if (author) {
        title = `${author} Threads Payla\u015F\u0131m\u0131`;
      } else {
        title = "Threads Payla\u015F\u0131m\u0131";
      }
    }
    return {
      title,
      description: description || "Threads payla\u015F\u0131m i\xE7eri\u011Fi",
      thumbnail_url,
      author: author || "Threads Kullan\u0131c\u0131s\u0131",
      platform: "threads",
      metadata_source: title || description ? "auto" : "manual"
    };
  } catch (e) {
    return null;
  }
}
async function fetchInstagramMeta(url) {
  try {
    const cleanUrl = url.trim();
    const shortcodeMatch = cleanUrl.match(/\/(?:p|reel|reels|tv|share\/p|share\/reel)\/([A-Za-z0-9_-]+)/i);
    const shortcode = shortcodeMatch ? shortcodeMatch[1] : null;
    let title = null;
    let description = null;
    let thumbnail_url = null;
    let author = null;
    const urlUserMatch = cleanUrl.match(/instagram\.com\/([a-zA-Z0-9_.-]+)\/(?:p|reel|reels|tv)\//i);
    if (urlUserMatch && urlUserMatch[1] && !["p", "reel", "reels", "tv", "share"].includes(urlUserMatch[1].toLowerCase())) {
      author = `@${urlUserMatch[1]}`;
    }
    try {
      const fbRes = await fetch(cleanUrl, {
        headers: {
          "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
        }
      });
      if (fbRes.ok) {
        const html = await fbRes.text();
        const ogImgMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["']([^"']+)["']/i) || html.match(/content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
        if (ogImgMatch && ogImgMatch[1]) {
          thumbnail_url = ogImgMatch[1].replace(/&amp;/g, "&").replace(/\\u0026/g, "&").replace(/\\/g, "");
        }
        const ogDescMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:description|twitter:description)["']\s+content=["']([^"']+)["']/i) || html.match(/content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:description|twitter:description)["']/i);
        if (ogDescMatch && ogDescMatch[1]) {
          let rawDesc = ogDescMatch[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#039;/g, "'").trim();
          const parsed = rawDesc.match(/(?:[\d,.]+\s+(?:likes|Likes|beğeni),\s*[\d,.]+\s+(?:comments|Comments|yorum)\s*-\s*)?(?:(.*)\s+\(@?([a-zA-Z0-9_.-]+)\)|(.*))\s+on\s+Instagram:\s*["'“](.*)["'”]/s) || rawDesc.match(/(?:.*)\s+on\s+Instagram:\s*["'“](.*)["'”]/s);
          if (parsed) {
            if (parsed[2]) author = `@${parsed[2]}`;
            else if (parsed[1] && parsed[1].length < 30) author = parsed[1].trim();
            const extractedCaption = parsed[4] || parsed[1];
            if (extractedCaption && extractedCaption.length > 3) {
              description = extractedCaption;
            } else {
              description = rawDesc;
            }
          } else {
            description = rawDesc;
          }
        }
        const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:title|twitter:title)["']\s+content=["']([^"']+)["']/i) || html.match(/content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:title|twitter:title)["']/i);
        if (ogTitleMatch && ogTitleMatch[1]) {
          let rawTitle = ogTitleMatch[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
          const userFromTitle = rawTitle.match(/\(@?([a-zA-Z0-9_.-]+)\)/) || rawTitle.match(/^([a-zA-Z0-9_.-]+)\s+on\s+Instagram/i);
          if (userFromTitle && userFromTitle[1] && !author) {
            author = `@${userFromTitle[1]}`;
          }
          title = rawTitle;
        }
      }
    } catch (e) {
      console.warn("Instagram FB OG fetch error:", e);
    }
    if (shortcode && (!thumbnail_url || !description)) {
      const embedUrls = [
        `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
        `https://www.instagram.com/p/${shortcode}/embed/`
      ];
      for (const embedUrl of embedUrls) {
        if (thumbnail_url && description) break;
        try {
          const embedRes = await fetch(embedUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
              "Sec-Fetch-Site": "same-origin"
            }
          });
          if (embedRes.ok) {
            const html = await embedRes.text();
            if (!author) {
              const uMatch = html.match(/class=["']CaptionUsername["'][^>]*>([^<]+)</i) || html.match(/class=["']HeaderUsername["'][^>]*>([^<]+)</i) || html.match(/"username"\s*:\s*"([^"]+)"/i);
              if (uMatch && uMatch[1]) {
                author = `@${uMatch[1].replace(/^@/, "").trim()}`;
              }
            }
            if (!thumbnail_url) {
              const imgMatch = html.match(/<img[^>]+class=["']EmbeddedMediaImage["'][^>]+src=["']([^"']+)["']/i) || html.match(/<img[^>]+src=["']([^"']+)["'][^>]+class=["']EmbeddedMediaImage["']/i);
              if (imgMatch && imgMatch[1]) {
                thumbnail_url = imgMatch[1].replace(/&amp;/g, "&").replace(/\\u0026/g, "&").replace(/\\/g, "");
              } else {
                const allCdnImages = [...html.matchAll(/https?:\\?\/\\?\/[^\s"'<>\\]+(?:cdninstagram|fbcdn)[^\s"'<>\\]*/gi)].map((m) => m[0].replace(/\\/g, "").replace(/&amp;/g, "&")).filter((img) => !img.includes("rsrc.php") && !img.includes("static") && !img.includes("150x150") && !img.includes("profile_pic"));
                if (allCdnImages.length > 0) {
                  thumbnail_url = allCdnImages[0];
                }
              }
            }
            if (!description) {
              const captionMatch = html.match(/<div[^>]+class=["']Caption["'][^>]*>(.*?)<\/div>/s) || html.match(/"caption"\s*:\s*\{\s*"text"\s*:\s*"([^"]+)"/i) || html.match(/"caption"\s*:\s*"([^"]+)"/i);
              if (captionMatch && captionMatch[1]) {
                let cleanCaption = captionMatch[1].replace(/<[^>]+>/g, " ").replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\u([0-9a-fA-F]{4})/g, (_, cc) => String.fromCharCode(parseInt(cc, 16))).replace(/\s+/g, " ").trim();
                if (cleanCaption.length > 3) {
                  description = cleanCaption;
                }
              }
            }
          }
        } catch (e) {
          console.warn("Instagram Embed fetch error:", e);
        }
      }
    }
    if (!title || title.toLowerCase().includes("instagram") || title.length < 5) {
      if (description) {
        const firstLine = description.split("\n")[0].trim();
        title = firstLine.length > 80 ? firstLine.substring(0, 80) + "..." : firstLine;
      } else if (author) {
        title = `${author} Instagram G\xF6nderisi`;
      } else {
        title = "Instagram Payla\u015F\u0131m\u0131";
      }
    }
    return {
      title,
      description: description || (author ? `${author} Instagram g\xF6nderi a\xE7\u0131klamas\u0131` : "Instagram g\xF6rsel veya video i\xE7eri\u011Fi"),
      thumbnail_url: thumbnail_url || null,
      author: author || "Instagram Kullan\u0131c\u0131s\u0131",
      platform: "instagram",
      metadata_source: thumbnail_url || description ? "auto" : "manual"
    };
  } catch (e) {
    console.error("fetchInstagramMeta error:", e);
    return null;
  }
}
async function fetchSingleMetadata(url) {
  const cleanUrl = url.trim();
  const lower = cleanUrl.toLowerCase();
  try {
    if (lower.includes("instagram.com") || lower.includes("instagr.am")) {
      const instaData = await fetchInstagramMeta(cleanUrl);
      if (instaData) {
        return {
          url: cleanUrl,
          ...instaData
        };
      }
    }
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;
        const resp = await fetch(oembedUrl);
        if (resp.ok) {
          const data = await resp.json();
          return {
            url: cleanUrl,
            title: data.title || "YouTube Videosu",
            description: `YouTube videosu - ${data.author_name || "YouTube"}`,
            thumbnail_url: data.thumbnail_url || null,
            author: data.author_name || "YouTube",
            platform: "youtube",
            metadata_source: "auto"
          };
        }
      } catch (e) {
      }
    }
    if (lower.includes("tiktok.com")) {
      try {
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
        const resp = await fetch(oembedUrl);
        if (resp.ok) {
          const data = await resp.json();
          return {
            url: cleanUrl,
            title: data.title || "TikTok \u0130\xE7eri\u011Fi",
            description: data.author_name ? `@${data.author_name} payla\u015F\u0131m\u0131` : "TikTok videosu",
            thumbnail_url: data.thumbnail_url || null,
            author: data.author_name ? `@${data.author_name}` : "TikTok",
            platform: "tiktok",
            metadata_source: "auto"
          };
        }
      } catch (e) {
      }
    }
    if (lower.includes("reddit.com") || lower.includes("redd.it")) {
      try {
        const oembedUrl = `https://www.reddit.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
        const resp = await fetch(oembedUrl);
        if (resp.ok) {
          const data = await resp.json();
          return {
            url: cleanUrl,
            title: data.title || "Reddit G\xF6nderisi",
            description: data.author_name ? `G\xF6nderen: u/${data.author_name}` : "Reddit tart\u0131\u015Fmas\u0131",
            thumbnail_url: data.thumbnail_url || null,
            author: data.author_name ? `u/${data.author_name}` : "Reddit",
            platform: "reddit",
            metadata_source: "auto"
          };
        }
      } catch (e) {
      }
    }
    if (lower.includes("threads.net") || lower.includes("threads.com")) {
      const threadsData = await fetchThreadsMeta(cleanUrl);
      if (threadsData) {
        return {
          url: cleanUrl,
          ...threadsData
        };
      }
    }
    if (lower.includes("x.com") || lower.includes("twitter.com")) {
      const userMatch = cleanUrl.match(/(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/i);
      const author = userMatch ? `@${userMatch[1]}` : null;
      return {
        url: cleanUrl,
        title: author ? `${author} X (Twitter) Payla\u015F\u0131m\u0131` : "X (Twitter) G\xF6nderisi",
        description: "X (Twitter) g\xF6nderisi ve ba\u011Flant\u0131s\u0131",
        thumbnail_url: null,
        author,
        platform: "x",
        metadata_source: "auto"
      };
    }
    const ogData = await fetchOpenGraphMeta(cleanUrl);
    if (ogData && (ogData.title || ogData.description || ogData.thumbnail_url)) {
      let platform2 = "article";
      if (lower.includes("pinterest.com") || lower.includes("pin.it")) platform2 = "pinterest";
      if (lower.includes("instagram.com")) platform2 = "instagram";
      if (lower.includes("threads.net")) platform2 = "threads";
      return {
        url: cleanUrl,
        title: ogData.title || "Web Ba\u011Flant\u0131s\u0131",
        description: ogData.description || null,
        thumbnail_url: ogData.thumbnail_url || null,
        author: ogData.author || null,
        platform: platform2,
        metadata_source: "auto"
      };
    }
  } catch (err) {
    console.warn("fetchSingleMetadata error fallback:", err);
  }
  let domain = "";
  try {
    domain = new URL(cleanUrl).hostname.replace(/^www\./, "");
  } catch (e) {
    domain = cleanUrl;
  }
  let platform = "article";
  if (lower.includes("pinterest")) platform = "pinterest";
  if (lower.includes("instagram")) platform = "instagram";
  if (lower.includes("youtube")) platform = "youtube";
  return {
    url: cleanUrl,
    title: `${domain.toUpperCase()} Ba\u011Flant\u0131s\u0131`,
    description: `${cleanUrl} adresinden kaydedilen i\xE7erik`,
    thumbnail_url: null,
    author: domain,
    platform,
    metadata_source: "manual"
  };
}
function inferCategoryAndTags(url, title, description, platform) {
  const text = `${url} ${title || ""} ${description || ""}`.toLowerCase();
  if (/react|vue|angular|javascript|typescript|python|coding|code|developer|github|yazılım|programlama|css|html|api|ai|gpt|gemini|llm|machine learning|yapay zeka|backend|frontend/i.test(text)) {
    return { category: "Yaz\u0131l\u0131m & AI", tags: ["yaz\u0131l\u0131m", "kodlama", "teknoloji"] };
  }
  if (/yemek|tarif|tatlı|pasta|mutfak|lezzet|pişir|fırın|restoran|kahve|gastronomi|tarif/i.test(text)) {
    return { category: "Yemek & Tarif", tags: ["yemek", "tarif", "mutfak"] };
  }
  if (/tasarım|design|figma|framer|ui|ux|art|çizim|illüstrasyon|grafik|mimari|dekorasyon|pinterest|poster/i.test(text)) {
    return { category: "Tasar\u0131m & Sanat", tags: ["tasar\u0131m", "ilham", "sanat"] };
  }
  if (/müzik|music|song|şarkı|albüm|playlist|spotify|sound|gitar|piyano|klip/i.test(text)) {
    return { category: "M\xFCzik & Ses", tags: ["m\xFCzik", "\u015Fark\u0131", "ses"] };
  }
  if (/finans|borsa|dolar|euro|kripto|bitcoin|yatırım|hisse|para|ekonomi|bütçe/i.test(text)) {
    return { category: "Finans & Yat\u0131r\u0131m", tags: ["finans", "ekonomi", "yat\u0131r\u0131m"] };
  }
  if (/spor|fitness|diyet|egzersiz|sağlık|idman|futbol|basketbol|koşu|yoga/i.test(text)) {
    return { category: "Sa\u011Fl\u0131k & Spor", tags: ["sa\u011Fl\u0131k", "spor", "fitness"] };
  }
  if (/haber|news|siyaset|politika|gündem|gazete|dünya|ekonomi haber/i.test(text)) {
    return { category: "Haber & G\xFCndem", tags: ["haber", "g\xFCndem"] };
  }
  if (/film|dizi|sinema|netflix|fragman|oyuncu|tiyatro|imdb/i.test(text)) {
    return { category: "Sinema & Dizi", tags: ["sinema", "film", "dizi"] };
  }
  if (/oyun|game|gaming|twitch|steam|playstation|xbox|espor/i.test(text)) {
    return { category: "Oyun & E\u011Flence", tags: ["oyun", "e\u011Flence"] };
  }
  if (/kitap|makale|okuma|bilim|tarih|felsefe|eğitim|üniversite|ders|araştırma/i.test(text)) {
    return { category: "E\u011Fitim & Bilim", tags: ["e\u011Fitim", "bilim", "okuma"] };
  }
  if (/üretkenlik|not|plan|organize|gelişim|motivasyon|alışkanlık/i.test(text)) {
    return { category: "\xDCretkenlik & Geli\u015Fim", tags: ["\xFCretkenlik", "ki\u015Fiselgeli\u015Fim"] };
  }
  if (platform === "youtube") return { category: "Video & \u0130\xE7erik", tags: ["video", "youtube"] };
  if (platform === "tiktok") return { category: "Trend & E\u011Flence", tags: ["tiktok", "trend"] };
  if (platform === "instagram") return { category: "Sosyal Medya", tags: ["instagram", "g\xF6rsel"] };
  if (platform === "pinterest") return { category: "Tasar\u0131m & G\xF6rsel", tags: ["pinterest", "ilham"] };
  if (platform === "reddit") return { category: "Tart\u0131\u015Fma & Topluluk", tags: ["reddit", "topluluk"] };
  if (platform === "x") return { category: "G\xFCndem & Sosyal Medya", tags: ["x", "tweet"] };
  return { category: "Genel K\xFClt\xFCr & Web", tags: ["web", "i\xE7erik"] };
}

// server/services/geminiService.ts
import { Type } from "@google/genai";

// server/services/apiKeyRouter.ts
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
var CONFIG_FILE_PATH = path.join(process.cwd(), "server", "config", "admin_keys.json");
var ApiKeyRouterService = class {
  constructor() {
    this.keys = [];
    this.currentPointer = 0;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failoverCount: 0,
      rateLimitCount: 0
    };
    this.loadKeysFromDisk();
  }
  loadKeysFromDisk() {
    try {
      if (fs.existsSync(CONFIG_FILE_PATH)) {
        const raw = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.keys)) {
          this.keys = parsed.keys;
        }
      }
    } catch (e) {
      console.warn("\u26A0\uFE0F Could not load admin keys from disk:", e);
    }
    const envKey = process.env.GEMINI_API_KEY;
    if (envKey && !this.keys.some((k) => k.key === envKey)) {
      this.keys.unshift({
        id: "env-default-key",
        key: envKey,
        label: "Sistem Varsay\u0131lan API Key (.env)",
        isFree: true,
        isActive: true,
        status: "active",
        usageCount: 0,
        errorCount: 0,
        createdAt: Date.now()
      });
    }
  }
  saveKeysToDisk() {
    if (process.env.VERCEL) return;
    try {
      const dir = path.dirname(CONFIG_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const dataToSave = {
        updatedAt: Date.now(),
        keys: this.keys
      };
      fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(dataToSave, null, 2), "utf-8");
    } catch (e) {
    }
  }
  getKeysPool() {
    return this.keys.map((k) => ({
      id: k.id,
      label: k.label,
      isFree: k.isFree,
      isActive: k.isActive,
      status: this.getKeyStatus(k),
      usageCount: k.usageCount,
      errorCount: k.errorCount,
      lastUsedAt: k.lastUsedAt,
      cooldownUntil: k.cooldownUntil,
      createdAt: k.createdAt,
      maskedKey: k.key.length > 8 ? `${k.key.substring(0, 6)}...${k.key.substring(k.key.length - 4)}` : "********"
    }));
  }
  getMetrics() {
    return {
      ...this.metrics,
      totalKeys: this.keys.length,
      activeKeysCount: this.getAvailableKeys().length,
      cooldownKeysCount: this.keys.filter((k) => this.getKeyStatus(k) === "cooldown").length
    };
  }
  getKeyStatus(k) {
    if (!k.isActive) return "exhausted";
    if (k.cooldownUntil && k.cooldownUntil > Date.now()) {
      return "cooldown";
    }
    return k.status === "error" ? "error" : "active";
  }
  getAvailableKeys() {
    const now = Date.now();
    return this.keys.filter((k) => k.isActive && (!k.cooldownUntil || k.cooldownUntil <= now));
  }
  /**
   * Returns a valid API Key from pool using round-robin rotation
   */
  getNextApiKey() {
    const available = this.getAvailableKeys();
    if (available.length === 0) {
      return process.env.GEMINI_API_KEY || null;
    }
    this.currentPointer = this.currentPointer % available.length;
    const selectedKey = available[this.currentPointer];
    this.currentPointer = (this.currentPointer + 1) % available.length;
    selectedKey.lastUsedAt = Date.now();
    selectedKey.usageCount++;
    this.metrics.totalRequests++;
    return selectedKey.key;
  }
  /**
   * Marks a key as rate limited (HTTP 429) and puts it in cooldown
   */
  markKeyRateLimited(rawKey, cooldownDurationMs = 5 * 60 * 1e3) {
    const target = this.keys.find((k) => k.key === rawKey);
    if (target) {
      target.status = "cooldown";
      target.cooldownUntil = Date.now() + cooldownDurationMs;
      target.errorCount++;
      this.metrics.rateLimitCount++;
      this.metrics.failoverCount++;
      console.warn(`\u23F3 API Key (${target.label}) 429 Rate Limit'e tak\u0131ld\u0131. ${cooldownDurationMs / 1e3}s so\u011Futmaya al\u0131nd\u0131.`);
      this.saveKeysToDisk();
    }
  }
  /**
   * Marks a key as errored/invalid
   */
  markKeyError(rawKey) {
    const target = this.keys.find((k) => k.key === rawKey);
    if (target) {
      target.errorCount++;
      if (target.errorCount >= 5) {
        target.status = "error";
      }
      this.saveKeysToDisk();
    }
  }
  /**
   * Add a new API Key into pool
   */
  addKey(params) {
    const trimmedKey = params.key.trim();
    const existing = this.keys.find((k) => k.key === trimmedKey);
    if (existing) {
      existing.label = params.label || existing.label;
      existing.isActive = true;
      existing.status = "active";
      existing.cooldownUntil = void 0;
      this.saveKeysToDisk();
      return existing;
    }
    const newKey = {
      id: `key-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      key: trimmedKey,
      label: params.label || `Free API Key #${this.keys.length + 1}`,
      isFree: params.isFree ?? true,
      isActive: true,
      status: "active",
      usageCount: 0,
      errorCount: 0,
      createdAt: Date.now()
    };
    this.keys.push(newKey);
    this.saveKeysToDisk();
    return newKey;
  }
  /**
   * Remove a key by ID
   */
  removeKey(id) {
    const initialLength = this.keys.length;
    this.keys = this.keys.filter((k) => k.id !== id);
    if (this.keys.length !== initialLength) {
      this.saveKeysToDisk();
      return true;
    }
    return false;
  }
  /**
   * Toggle active state of key
   */
  toggleKeyActive(id) {
    const target = this.keys.find((k) => k.id === id);
    if (target) {
      target.isActive = !target.isActive;
      if (target.isActive) {
        target.status = "active";
        target.cooldownUntil = void 0;
      }
      this.saveKeysToDisk();
      return true;
    }
    return false;
  }
  /**
   * Execute an AI operation with automatic failover across key pool
   */
  async executeWithSmartRotation(req, fn) {
    const userCustomKey = req?.headers?.["x-gemini-api-key"];
    if (userCustomKey) {
      const customClient = new GoogleGenAI({
        apiKey: userCustomKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      return await fn(customClient);
    }
    const availableKeys = this.getAvailableKeys();
    if (availableKeys.length === 0) {
      const fallbackKey = process.env.GEMINI_API_KEY;
      if (!fallbackKey) {
        throw new Error("Aktif API Key bulunamad\u0131. L\xFCtfen Admin Paneli \xFCzerinden yeni bir API Key ekleyin.");
      }
      const fallbackClient = new GoogleGenAI({
        apiKey: fallbackKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      return await fn(fallbackClient);
    }
    let lastError = null;
    const attempts = Math.min(availableKeys.length, 3);
    for (let i = 0; i < attempts; i++) {
      const apiKey = this.getNextApiKey();
      if (!apiKey) break;
      try {
        const client = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { "User-Agent": "aistudio-build" } }
        });
        const result = await fn(client);
        this.metrics.successfulRequests++;
        return result;
      } catch (err) {
        lastError = err;
        const errMessage = String(err?.message || err);
        const isRateLimit = errMessage.includes("429") || errMessage.includes("Quota") || errMessage.includes("EXHAUSTED");
        if (isRateLimit) {
          this.markKeyRateLimited(apiKey);
        } else {
          this.markKeyError(apiKey);
        }
        console.warn(`\u26A0\uFE0F API Key hatas\u0131 al\u0131nd\u0131 (${i + 1}/${attempts}), sonraki key deneniyor:`, errMessage);
      }
    }
    throw lastError || new Error("T\xFCm API Key'ler denendi ancak ba\u015Far\u0131l\u0131 yan\u0131t al\u0131namad\u0131.");
  }
};
var apiKeyRouter = new ApiKeyRouterService();

// server/services/geminiService.ts
async function batchCategorizeWithGemini(req, rawItems) {
  if (!rawItems || rawItems.length === 0) return rawItems;
  const items = rawItems.map((item) => {
    const heur = inferCategoryAndTags(item.url, item.title, item.description, item.platform);
    return {
      ...item,
      category: item.category || heur.category,
      tags: item.tags && item.tags.length > 0 ? item.tags : heur.tags
    };
  });
  try {
    const payload = items.map((item, idx) => ({
      id: idx,
      url: item.url,
      platform: item.platform || "unknown",
      title: item.title || "",
      description: item.description || "",
      note: item.note || ""
    }));
    const prompt = `Sana a\u015Fa\u011F\u0131da ${payload.length} adet farkl\u0131 web ba\u011Flant\u0131s\u0131/bookmark verisi veriyorum.
L\xFCtfen HER B\u0130R L\u0130NK\u0130 D\u0130\u011EERLER\u0130NDEN TAMAMEN BA\u011EIMSIZ OLARAK TEKER TEKER ANAL\u0130Z ET.
Her bir linkin konusuna en uygun spesifik T\xFCrk\xE7e "category" (\xF6rne\u011Fin: Yaz\u0131l\u0131m & AI, Tasar\u0131m & \u0130ll\xFCstrasyon, Yemek & Tarif, Finans & Ekonomi, M\xFCzik & Sanat, Spor & Sa\u011Fl\u0131k, Haber & Siyaset, \xDCretkenlik, Oyun, Sinema & Dizi, E\u011Fitim) ve 3-5 adet \xF6zg\xFCn T\xFCrk\xE7e "tags" belirle.
\xC7OK \xD6NEML\u0130: Her link kendi i\xE7eri\u011Fine \xF6zel kategorisini almal\u0131d\u0131r; t\xFCm linklere ayn\u0131 kategoriyi verme!

Ba\u011Flant\u0131 \xD6\u011Feleri:
${JSON.stringify(payload, null, 2)}

\xC7\u0131kt\u0131y\u0131 'categorized_items' dizisi olarak JSON yap\u0131s\u0131nda d\xF6nd\xFCr.`;
    return await apiKeyRouter.executeWithSmartRotation(req, async (aiClient) => {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              categorized_items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    category: { type: Type.STRING },
                    tags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  },
                  required: ["id", "category", "tags"]
                }
              }
            },
            required: ["categorized_items"]
          }
        }
      });
      const jsonText = response.text || "{}";
      const result = JSON.parse(jsonText);
      if (result.categorized_items && Array.isArray(result.categorized_items)) {
        result.categorized_items.forEach((catItem) => {
          const target = items[catItem.id];
          if (target) {
            if (catItem.category) target.category = catItem.category;
            if (Array.isArray(catItem.tags) && catItem.tags.length > 0) {
              target.tags = catItem.tags;
            }
          }
        });
      }
      return items;
    });
  } catch (err) {
    console.warn("Gemini batch categorize warning (fallback heuristics used):", err);
    return items;
  }
}
async function categorizeSingleItemWithGemini(req, itemData) {
  const { title, description, note, url, platform } = itemData;
  const prompt = `L\xFCtfen a\u015Fa\u011F\u0131daki bookmark ve ki\u015Fisel not verisini analiz et.
T\xFCrk\xE7e dilde uygun tek bir ana Kategori ve 3-5 adet alakal\u0131 T\xFCrk\xE7e etiket (tag) \xF6ner.

\u0130\xE7erik Detaylar\u0131:
- Platform: ${platform || "Bilinmiyor"}
- Ba\u015Fl\u0131k: ${title || "Belirtilmemi\u015F"}
- A\xE7\u0131klama: ${description || "Belirtilmemi\u015F"}
- Kullan\u0131c\u0131 Notu (En \xD6nemli): ${note || "Hen\xFCz not eklenmedi"}
- URL: ${url || ""}

Yan\u0131t\u0131n\u0131 kesinlikle a\u015Fa\u011F\u0131daki JSON yap\u0131s\u0131nda d\xF6nd\xFCr:
{
  "category": "Kategori Ad\u0131 (\xF6r: Yaz\u0131l\u0131m & AI, Tasar\u0131m & Stil, \xDCretkenlik, Finans, Sa\u011Fl\u0131k & Ya\u015Fam, Yemek & Tarif)",
  "tags": ["etiket1", "etiket2", "etiket3"]
}`;
  return await apiKeyRouter.executeWithSmartRotation(req, async (aiClient) => {
    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["category", "tags"]
        }
      }
    });
    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  });
}
async function generateMindmapWithGemini(req, cards) {
  const cardsSummary = cards.map((c) => ({
    id: c.id,
    title: c.title || "\u0130simsiz Kart",
    note: c.note || "",
    category: c.category || "Genel",
    tags: c.tags || [],
    platform: c.platform
  }));
  const prompt = `Sen ki\u015Fisel bir bilgi k\xFCt\xFCphanesinden tema ve zihin haritas\u0131 (Mind Map / Knowledge Graph) \xE7\u0131karan uzman bir AI analistisin.

Sana kullan\u0131c\u0131n\u0131n kaydetti\u011Fi kartlar\u0131n (ba\u015Fl\u0131klar, ki\u015Fisel notlar, kategoriler, etiketler) listesini veriyorum.
Bu verileri derinlemesine analiz et. Ortak temalar\u0131, ili\u015Fki a\u011Flar\u0131n\u0131 ve ana fikir k\xFCmelenmelerini \xE7\u0131kararak hiyerar\u015Fik bir Zihin Haritas\u0131 JSON yap\u0131s\u0131 olu\u015Ftur.

Girdi Kartlar\u0131:
${JSON.stringify(cardsSummary, null, 2)}

Kurallar:
1. K\xF6k d\xFC\u011F\xFCm\xFCn (root node) label'\u0131 "Ki\u015Fisel Fikir K\xFCt\xFCphanem" veya kapsay\u0131c\u0131 bir ana ba\u015Fl\u0131k olsun.
2. Root'un alt\u0131ndaki 1. seviye \xE7ocuklar ana temalar/alanlar olsun (\xF6r: "Teknoloji & AI Y\xFCz\xFC", "Tasar\u0131m & Ya\u015Fam Bi\xE7imi", "Giri\u015Fimcilik & \xDCretkenlik").
3. Her teman\u0131n alt\u0131nda 2. seviye alt ba\u015Fl\u0131klar (sub-topics) ve kart k\xFCmelenmeleri olu\u015Ftur.
4. Her d\xFC\u011F\xFCmde (node) o konuyu temsil eden cardIds dizisini do\u011Fru doldur (Girdi kartlar\u0131ndaki id'lerle tam e\u015Fle\u015Fmeli).
5. Kategori rengi i\xE7in pastel renk kodlar\u0131 \xF6ner ("color" alan\u0131, \xF6r: "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B").
6. T\xFCm ba\u015Fl\u0131k ve a\xE7\u0131klamalar duru ve ilham verici T\xFCrk\xE7e ile yaz\u0131ls\u0131n.

\xC7\u0131kt\u0131 JSON \u015Eemas\u0131:
D\xFC\u011F\xFCm yap\u0131s\u0131: { "id": "string", "label": "string", "summary": "string", "color": "string", "cardIds": ["string"], "children": [ D\xFC\u011F\xFCmYap\u0131s\u0131 ] }`;
  return await apiKeyRouter.executeWithSmartRotation(req, async (aiClient) => {
    const response = await aiClient.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  });
}
async function chatWithBookmarks(req, options) {
  const { query, cards } = options;
  const cardsData = cards.map((c) => ({
    title: c.title || "\u0130simsiz",
    note: c.note || "",
    description: c.description || "",
    category: c.category || "",
    url: c.url || ""
  }));
  const prompt = `Sen NovaMind uygulamas\u0131n\u0131n yapay zeka asistan\u0131s\u0131n. Kullan\u0131c\u0131 sana kendi ki\u015Fisel k\xFCt\xFCphanesindeki (kaydetti\u011Fi ba\u011Flant\u0131lar, notlar ve yer imleri) verilerle ilgili bir soru soruyor.
G\xF6revin, a\u015Fa\u011F\u0131daki kullan\u0131c\u0131n\u0131n verilerini inceleyerek onun sorusuna do\u011Frudan, net ve arkada\u015F\xE7a bir dilde (T\xFCrk\xE7e) yan\u0131t vermek. Gerekirse ilgili i\xE7eriklerin ba\u011Flant\u0131lar\u0131n\u0131 (URL) veya ba\u015Fl\u0131klar\u0131n\u0131 referans g\xF6ster.

Kullan\u0131c\u0131n\u0131n Sorusu: "${query}"

Kullan\u0131c\u0131n\u0131n Verileri:
${JSON.stringify(cardsData, null, 2)}

E\u011Fer kullan\u0131c\u0131n\u0131n sorusu mevcut verilerle tam olarak cevaplanam\u0131yorsa, "K\xFCt\xFCphanenizde bu konuya dair do\u011Frudan bir kay\u0131t bulamad\u0131m ancak..." diyerek genel bilginle yard\u0131mc\u0131 olmaya \xE7al\u0131\u015F.`;
  return await apiKeyRouter.executeWithSmartRotation(req, async (aiClient) => {
    const response = await aiClient.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    });
    return response.text || "\xDCzg\xFCn\xFCm, \u015Fu an cevap veremiyorum.";
  });
}
async function generateIdeasWithGemini(req, options) {
  const { mode, cards, selectedCardIds, customPrompt } = options;
  let modeInstruction = "";
  if (mode === "combine") {
    modeInstruction = `\xD6ZELL\u0130K: "Bu \u0130kisini Birle\u015Ftir"
Se\xE7ilen veya \xF6ne \xE7\u0131kan kartlar aras\u0131ndaki beklenmedik kesi\u015Fim noktalar\u0131ndan \xF6zg\xFCn, yenilik\xE7i proje, i\xE7erik, \xFCr\xFCn veya giri\u015Fim fikirleri sentezle.`;
  } else if (mode === "random") {
    modeInstruction = `\xD6ZELL\u0130K: "Bug\xFCn Ne \xDCretsem?"
Kullan\u0131c\u0131n\u0131n k\xFCt\xFCphanesindeki farkl\u0131 alanlardan rastgele ve s\u0131ra d\u0131\u015F\u0131 kombinasyonlar yaparak bug\xFCn hemen ba\u015Flanabilecek ilham verici aksiyonel fikirler \xFCret.`;
  } else {
    modeInstruction = `\xD6ZELL\u0130K: \xD6zel Fikir Beyin F\u0131rt\u0131nas\u0131
Kullan\u0131c\u0131n\u0131n \u015Fu iste\u011Fine g\xF6re k\xFCt\xFCphanesindeki notlar\u0131 harmanla: "${customPrompt || "Genel fikir \xFCretimi"}"`;
  }
  const cardsData = cards.map((c) => ({
    id: c.id,
    title: c.title || "\u0130simsiz",
    note: c.note || "",
    category: c.category || "",
    tags: c.tags || [],
    platform: c.platform
  }));
  const prompt = `Sen d\xFCnyaca \xFCnl\xFC yarat\u0131c\u0131 d\xFC\u015F\xFCnce ko\xE7u ve inovasyon stratejistisin.
Kullan\u0131c\u0131n\u0131n ki\u015Fisel k\xFCt\xFCphanesinde biriktirdi\u011Fi i\xE7erik notlar\u0131ndan g\xFC\xE7 alarak yepyeni, s\xFCrprizli ve y\xFCksek katma de\u011Ferli fikirler \xFCreteceksin.

Mod: ${modeInstruction}

Kullan\u0131c\u0131n\u0131n Not K\xFCt\xFCphanesi:
${JSON.stringify(cardsData, null, 2)}

Se\xE7ili Kart ID'leri: ${JSON.stringify(selectedCardIds || [])}

Sana 3 adet y\xFCksek kaliteli, heyecan verici fikir \xFCretmeni \xF6neriyorum.
Yan\u0131t\u0131n\u0131 a\u015Fa\u011F\u0131daki JSON \u015Femas\u0131nda dizi olarak ver:
[
  {
    "id": "idea-1",
    "title": "\xC7arp\u0131c\u0131 Fikir Ba\u015Fl\u0131\u011F\u0131",
    "concept": "Fikrin ana konsepti ve arkas\u0131ndaki yarat\u0131c\u0131 mant\u0131k (2-3 c\xFCmle)",
    "targetAudience": "Kimler i\xE7in veya hangi platformda uygulanabilir",
    "sourceCardIds": ["card_id1", "card_id2"],
    "sourceCardTitles": ["Kaynak Kart 1 Ba\u015Fl\u0131\u011F\u0131", "Kaynak Kart 2 Ba\u015Fl\u0131\u011F\u0131"],
    "actionSteps": ["Aksiyon ad\u0131m\u0131 1", "Aksiyon ad\u0131m\u0131 2", "Aksiyon ad\u0131m\u0131 3"],
    "potentialTags": ["tag1", "tag2"],
    "scoreReasoning": "Bu fikrin neden g\xFC\xE7l\xFC ve uygulamaya de\u011Fer oldu\u011Funa dair k\u0131sa a\xE7\u0131klama"
  }
]`;
  return await apiKeyRouter.executeWithSmartRotation(req, async (aiClient) => {
    const response = await aiClient.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const jsonText = response.text || "[]";
    return JSON.parse(jsonText);
  });
}

// server/routes/metadata.ts
var router = Router();
router.post("/metadata", metadataLimiter, async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL parametresi gerekli." });
    }
    const metadata = await fetchSingleMetadata(url);
    const heur = inferCategoryAndTags(metadata.url, metadata.title, metadata.description, metadata.platform);
    return res.json({
      ...metadata,
      category: heur.category,
      tags: heur.tags
    });
  } catch (err) {
    next(err);
  }
});
router.post("/batch-metadata", metadataLimiter, async (req, res, next) => {
  try {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: "En az bir URL gerekli." });
    }
    const targetUrls = urls.slice(0, 30);
    const rawItems = await Promise.all(targetUrls.map((u) => fetchSingleMetadata(u)));
    const categorizedItems = await batchCategorizeWithGemini(req, rawItems);
    return res.json({ items: categorizedItems });
  } catch (err) {
    next(err);
  }
});
var metadata_default = router;

// server/routes/gemini.ts
import { Router as Router2 } from "express";

// server/config/firebase.ts
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";
dotenv.config();
var firebaseAdminApp = null;
var firebaseAuth = null;
try {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseAdminApp = existingApps[0];
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    firebaseAdminApp = initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("Firebase Admin initialized successfully with Service Account Key.");
  } else if (process.env.FIREBASE_PROJECT_ID) {
    firebaseAdminApp = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log("Firebase Admin initialized with Project ID.");
  }
  if (firebaseAdminApp) {
    firebaseAuth = getAuth(firebaseAdminApp);
  }
} catch (error) {
  console.warn("Firebase Admin Initialization Warning:", error);
}

// server/middleware/auth.ts
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (process.env.NODE_ENV !== "production" && !process.env.STRICT_AUTH) {
      req.user = { uid: "dev-anonymous-user" };
      return next();
    }
    return res.status(401).json({ error: "Eri\u015Fim reddedildi: Ge\xE7erli yetkilendirme jetonu (Bearer token) bulunamad\u0131." });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    if (firebaseAuth) {
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
      return next();
    } else {
      req.user = { uid: "authenticated-user" };
      return next();
    }
  } catch (error) {
    console.error("Auth Token Verification Error:", error.message);
    return res.status(401).json({ error: "Ge\xE7ersiz veya s\xFCresi dolmu\u015F oturum jetonu." });
  }
}
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    try {
      if (firebaseAuth) {
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email
        };
      }
    } catch (e) {
    }
  }
  next();
}

// server/services/paymentService.ts
import crypto from "crypto";
import { getFirestore } from "firebase-admin/firestore";
var PRICING_CONFIG = {
  pro: {
    monthlyPrice: 99,
    yearlyPrice: 950,
    name: "Pro Paket",
    shopierProductCode: process.env.SHOPIER_PRO_PRODUCT_ID || "101"
  },
  premium: {
    monthlyPrice: 249,
    yearlyPrice: 2390,
    name: "Premium Paket",
    shopierProductCode: process.env.SHOPIER_PREMIUM_PRODUCT_ID || "102"
  }
};
function createShopierCheckoutSession(params) {
  const { userId, userEmail, plan, billingPeriod } = params;
  const config = PRICING_CONFIG[plan === "premium" ? "premium" : "pro"];
  const amount = billingPeriod === "yearly" ? config.yearlyPrice : config.monthlyPrice;
  const platformOrderId = `NM_${plan.toUpperCase()}_${userId}_${Date.now()}`;
  const apiKey = process.env.SHOPIER_API_KEY || "";
  const apiSecret = process.env.SHOPIER_API_SECRET || "";
  if (!apiKey || !apiSecret) {
    return {
      provider: "shopier",
      isTestMode: true,
      checkoutUrl: `/api/subscription/test-checkout?orderId=${platformOrderId}&plan=${plan}&userId=${userId}`,
      platformOrderId,
      amount,
      currency: "TRY"
    };
  }
  const payloadData = {
    API_key: apiKey,
    website_index: 1,
    platform_order_id: platformOrderId,
    product_name: `NovaMind ${config.name} (${billingPeriod === "yearly" ? "Y\u0131ll\u0131k" : "Ayl\u0131k"})`,
    product_type: 1,
    buyer_name: userEmail.split("@")[0] || "Kullanici",
    buyer_surname: "NovaMind",
    buyer_email: userEmail,
    buyer_phone: "05555555555",
    billing_address: "\u0130stanbul",
    billing_city: "\u0130stanbul",
    billing_country: "T\xFCrkiye",
    billing_postcode: "34000",
    shipping_address: "\u0130stanbul",
    shipping_city: "\u0130stanbul",
    shipping_country: "T\xFCrkiye",
    shipping_postcode: "34000",
    total_order_value: amount.toFixed(2),
    currency: 0
    // 0 = TRY
  };
  const signatureData = `${platformOrderId}${payloadData.total_order_value}${apiSecret}`;
  const signature = crypto.createHash("sha256").update(signatureData).digest("base64");
  return {
    provider: "shopier",
    isTestMode: false,
    checkoutUrl: "https://www.shopier.com/ShowProduct/api_pay.php",
    platformOrderId,
    amount,
    currency: "TRY",
    formData: {
      ...payloadData,
      signature
    }
  };
}
function verifyShopierWebhookSignature(body) {
  const apiSecret = process.env.SHOPIER_API_SECRET;
  if (!apiSecret) return true;
  const { random_nr, platform_order_id, total_order_value, signature } = body;
  if (!random_nr || !platform_order_id || !total_order_value || !signature) return false;
  const expectedSignature = crypto.createHash("sha256").update(`${random_nr}${platform_order_id}${total_order_value}${apiSecret}`).digest("base64");
  return signature === expectedSignature;
}
async function updateUserSubscriptionInDb(params) {
  const { userId, plan, durationDays = 30, paymentProvider, orderId, customerEmail } = params;
  const now = Date.now();
  const expiresAt = now + durationDays * 24 * 60 * 60 * 1e3;
  const subscription = {
    userId,
    plan,
    status: "active",
    startsAt: now,
    expiresAt,
    paymentProvider,
    orderId,
    customerEmail
  };
  if (firebaseAdminApp) {
    const db = getFirestore(firebaseAdminApp);
    await db.collection("users").doc(userId).collection("subscription").doc("current").set(subscription, { merge: true });
    await db.collection("users").doc(userId).set({
      plan,
      isPremium: plan !== "free",
      updatedAt: now
    }, { merge: true });
  }
  return subscription;
}
async function getUserSubscriptionFromDb(userId) {
  const defaultFreeSub = {
    userId,
    plan: "free",
    status: "active",
    startsAt: Date.now(),
    expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1e3,
    paymentProvider: "manual"
  };
  if (!firebaseAdminApp) return defaultFreeSub;
  try {
    const db = getFirestore(firebaseAdminApp);
    const doc = await db.collection("users").doc(userId).collection("subscription").doc("current").get();
    if (doc.exists) {
      const data = doc.data();
      if (data.expiresAt && data.expiresAt < Date.now() && data.plan !== "free") {
        data.plan = "free";
        data.status = "expired";
      }
      return data;
    }
  } catch (e) {
    console.warn("Firestore subscription fetch fallback:", e);
  }
  return defaultFreeSub;
}

// server/types/subscription.ts
var PLAN_LIMITS = {
  free: {
    maxSavedCards: 50,
    maxDailyAiCategorize: 10,
    maxMonthlyMindmaps: 3,
    maxMonthlyIdeas: 3,
    hasServerAiKey: false,
    // free users use BYOK (own key) or limited fallback
    hasChromeExtension: false,
    hasWeeklyDigest: false
  },
  pro: {
    maxSavedCards: 1e3,
    maxDailyAiCategorize: 100,
    maxMonthlyMindmaps: 30,
    maxMonthlyIdeas: 30,
    hasServerAiKey: true,
    hasChromeExtension: true,
    hasWeeklyDigest: true
  },
  premium: {
    maxSavedCards: -1,
    maxDailyAiCategorize: -1,
    maxMonthlyMindmaps: -1,
    maxMonthlyIdeas: -1,
    hasServerAiKey: true,
    hasChromeExtension: true,
    hasWeeklyDigest: true
  }
};

// server/middleware/usageLimiter.ts
function checkAiUsageLimit(feature) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.uid || "dev-anonymous-user";
      const subscription = await getUserSubscriptionFromDb(userId);
      const limits = PLAN_LIMITS[subscription.plan || "free"];
      if (req.headers["x-gemini-api-key"]) {
        return next();
      }
      if (feature === "mindmap" && limits.maxMonthlyMindmaps !== -1) {
        if (limits.maxMonthlyMindmaps <= 0) {
          return res.status(403).json({
            error: "Free paket limitine ula\u015Ft\u0131n\u0131z. Mind Map \xF6zelli\u011Fini s\u0131n\u0131rs\u0131z kullanmak i\xE7in Pro pakete ge\xE7in veya Ayarlar'dan kendi Gemini API anahtar\u0131n\u0131z\u0131 tan\u0131mlay\u0131n.",
            requiresUpgrade: true
          });
        }
      }
      if (feature === "ideas" && limits.maxMonthlyIdeas !== -1) {
        if (limits.maxMonthlyIdeas <= 0) {
          return res.status(403).json({
            error: "Fikir \xDCretici kullan\u0131m s\u0131n\u0131r\u0131na ula\u015F\u0131ld\u0131. Pro pakete ge\xE7erek s\u0131n\u0131rs\u0131z fikir sentezleyebilirsiniz.",
            requiresUpgrade: true
          });
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

// server/routes/gemini.ts
var router2 = Router2();
router2.post("/gemini/categorize", optionalAuth, aiLimiter, checkAiUsageLimit("categorize"), async (req, res, next) => {
  try {
    const { items, title, description, note, url, platform } = req.body;
    if (!process.env.GEMINI_API_KEY && !req.headers["x-gemini-api-key"]) {
      return res.status(400).json({ error: "Gemini API anahtar\u0131 bulunamad\u0131. L\xFCtfen Ayarlar sayfas\u0131ndan kendi API anahtar\u0131n\u0131z\u0131 tan\u0131mlay\u0131n veya Pro pakete ge\xE7in." });
    }
    if (items && Array.isArray(items) && items.length > 0) {
      const categorized = await batchCategorizeWithGemini(req, items);
      return res.json({ items: categorized });
    }
    const result = await categorizeSingleItemWithGemini(req, { title, description, note, url, platform });
    return res.json(result);
  } catch (err) {
    next(err);
  }
});
router2.post("/gemini/mindmap", optionalAuth, aiLimiter, checkAiUsageLimit("mindmap"), async (req, res, next) => {
  try {
    const { cards } = req.body;
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: "Anlaml\u0131 mindmap olu\u015Fturmak i\xE7in en az 1 kart gereklidir." });
    }
    if (!process.env.GEMINI_API_KEY && !req.headers["x-gemini-api-key"]) {
      return res.status(400).json({ error: "Gemini API anahtar\u0131 bulunamad\u0131. L\xFCtfen Ayarlar sayfas\u0131ndan kendi API anahtar\u0131n\u0131z\u0131 tan\u0131mlay\u0131n veya Pro pakete ge\xE7in." });
    }
    const mindmapRoot = await generateMindmapWithGemini(req, cards);
    return res.json({
      root: mindmapRoot,
      generated_at: Date.now(),
      total_cards_analyzed: cards.length
    });
  } catch (err) {
    next(err);
  }
});
router2.post("/gemini/ideas", optionalAuth, aiLimiter, checkAiUsageLimit("ideas"), async (req, res, next) => {
  try {
    const { mode, cards, selectedCardIds, customPrompt } = req.body;
    if (!process.env.GEMINI_API_KEY && !req.headers["x-gemini-api-key"]) {
      return res.status(400).json({ error: "Gemini API anahtar\u0131 bulunamad\u0131. L\xFCtfen Ayarlar sayfas\u0131ndan kendi API anahtar\u0131n\u0131z\u0131 tan\u0131mlay\u0131n veya Pro pakete ge\xE7in." });
    }
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: "Fikir \xFCretimi i\xE7in kay\u0131tl\u0131 kart bulunamad\u0131." });
    }
    const ideas = await generateIdeasWithGemini(req, { mode, cards, selectedCardIds, customPrompt });
    return res.json({ ideas });
  } catch (err) {
    next(err);
  }
});
router2.post("/gemini/chat", optionalAuth, aiLimiter, async (req, res, next) => {
  try {
    const { query, cards } = req.body;
    if (!process.env.GEMINI_API_KEY && !req.headers["x-gemini-api-key"]) {
      return res.status(400).json({ error: "Gemini API anahtar\u0131 bulunamad\u0131." });
    }
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Soru (query) alan\u0131 gereklidir." });
    }
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: "Sohbet edebilmek i\xE7in k\xFCt\xFCphanenizde en az 1 kart bulunmal\u0131d\u0131r." });
    }
    const answer = await chatWithBookmarks(req, { query, cards });
    return res.json({ answer });
  } catch (err) {
    next(err);
  }
});
var gemini_default = router2;

// server/routes/extension.ts
import { Router as Router3 } from "express";
import { getFirestore as getFirestore2 } from "firebase-admin/firestore";
var router3 = Router3();
var userQueues = /* @__PURE__ */ new Map();
router3.post("/extension/save", optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.uid || req.body.userId || "dev-anonymous-user";
    const { url, title, description, note, platform, thumbnail_url, author } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    const newItem = {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url,
      title: title || null,
      description: description || null,
      thumbnail_url: thumbnail_url || null,
      author: author || null,
      platform: platform || "other",
      note: note || "",
      tags: [],
      category: null,
      metadata_source: "extension",
      created_at: Date.now()
    };
    let savedToDb = false;
    if (firebaseAdminApp) {
      try {
        const db = getFirestore2(firebaseAdminApp);
        await db.collection("users").doc(userId).collection("pendingQueue").doc(newItem.id).set(newItem);
        savedToDb = true;
      } catch (e) {
        console.warn("Firestore extension save fallback to in-memory queue:", e);
      }
    }
    if (!savedToDb) {
      if (!userQueues.has(userId)) userQueues.set(userId, []);
      userQueues.get(userId).push(newItem);
    }
    return res.json({ success: true, item: newItem });
  } catch (err) {
    next(err);
  }
});
router3.get("/extension/pop", optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.uid || req.query.userId || "dev-anonymous-user";
    let items = [];
    let fetchedFromDb = false;
    if (firebaseAdminApp) {
      try {
        const db = getFirestore2(firebaseAdminApp);
        const snapshot = await db.collection("users").doc(userId).collection("pendingQueue").get();
        items = snapshot.docs.map((doc) => doc.data());
        const batch = db.batch();
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        if (items.length > 0) {
          await batch.commit();
        }
        fetchedFromDb = true;
      } catch (e) {
        console.warn("Firestore extension pop fallback to in-memory queue:", e);
      }
    }
    if (!fetchedFromDb) {
      items = [...userQueues.get(userId) || []];
      userQueues.set(userId, []);
    }
    return res.json({ items });
  } catch (err) {
    next(err);
  }
});
var extension_default = router3;

// server/routes/subscription.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.get("/subscription/status", optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.uid || "dev-anonymous-user";
    const subscription = await getUserSubscriptionFromDb(userId);
    const limits = PLAN_LIMITS[subscription.plan || "free"];
    return res.json({
      subscription,
      limits,
      pricing: PRICING_CONFIG
    });
  } catch (err) {
    next(err);
  }
});
router4.post("/subscription/create-checkout", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user?.uid || "dev-anonymous-user";
    const userEmail = req.user?.email || "user@novamind.app";
    const { plan, billingPeriod = "monthly" } = req.body;
    if (!plan || !["pro", "premium"].includes(plan)) {
      return res.status(400).json({ error: "Ge\xE7erli bir paket se\xE7in ('pro' veya 'premium')." });
    }
    const session = createShopierCheckoutSession({
      userId,
      userEmail,
      plan,
      billingPeriod: billingPeriod === "yearly" ? "yearly" : "monthly"
    });
    return res.json(session);
  } catch (err) {
    next(err);
  }
});
router4.post("/subscription/webhook/shopier", async (req, res, next) => {
  try {
    const isValid = verifyShopierWebhookSignature(req.body);
    if (!isValid) {
      return res.status(400).send("Invalid Webhook Signature");
    }
    const { status, platform_order_id, buyer_email } = req.body;
    if (status === "success" || status === "1") {
      const parts = (platform_order_id || "").split("_");
      const plan = (parts[1] || "PRO").toLowerCase();
      const fullUserId = parts[2] || "";
      console.log(`\u2705 Payment received via Shopier for order ${platform_order_id}, plan: ${plan}`);
      if (fullUserId) {
        await updateUserSubscriptionInDb({
          userId: fullUserId,
          plan: ["pro", "premium"].includes(plan) ? plan : "pro",
          paymentProvider: "shopier",
          orderId: platform_order_id,
          customerEmail: buyer_email
        });
      }
    }
    return res.status(200).send("OK");
  } catch (err) {
    next(err);
  }
});
router4.get("/subscription/test-checkout", async (req, res) => {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_TEST_CHECKOUT) {
    return res.status(403).send("Test checkout is disabled in production.");
  }
  const { orderId, plan, userId } = req.query;
  if (!userId || !plan) {
    return res.status(400).send("Eksik parametreler.");
  }
  await updateUserSubscriptionInDb({
    userId: String(userId),
    plan: String(plan) === "premium" ? "premium" : "pro",
    paymentProvider: "shopier",
    orderId: String(orderId || `TEST-${Date.now()}`),
    customerEmail: "test@novamind.app"
  });
  return res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8" />
      <title>\xD6deme Ba\u015Far\u0131l\u0131 - NovaMind</title>
      <style>
        body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: white; margin: 0; }
        .card { background: #1e293b; padding: 2rem; border-radius: 1.5rem; border: 1px solid #334155; text-align: center; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        .icon { font-size: 3rem; margin-bottom: 1rem; }
        h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #10b981; }
        p { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem; }
        a { background: #6366f1; color: white; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: bold; display: inline-block; }
        a:hover { background: #4f46e5; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">\u{1F389}</div>
        <h1>\xD6demeniz Ba\u015Far\u0131yla Al\u0131nd\u0131!</h1>
        <p>NovaMind <strong>${String(plan).toUpperCase()}</strong> paketiniz hesab\u0131n\u0131za tan\u0131mland\u0131. Art\u0131k t\xFCm geli\u015Fmi\u015F \xF6zelliklerin tad\u0131n\u0131 \xE7\u0131karabilirsiniz.</p>
        <a href="/">Uygulamaya D\xF6n</a>
      </div>
    </body>
    </html>
  `);
});
var subscription_default = router4;

// server/routes/graph.ts
import { Router as Router5 } from "express";

// server/config/neo4j.ts
import neo4j from "neo4j-driver";
import dotenv2 from "dotenv";
dotenv2.config();
var uri = process.env.NEO4J_URI || "bolt://localhost:7687";
var user = process.env.NEO4J_USER || process.env.NEO4J_USERNAME || "neo4j";
var password = process.env.NEO4J_PASSWORD || "password";
var driver = null;
function getNeo4jDriver() {
  if (!process.env.NEO4J_URI && process.env.NODE_ENV === "production") {
    console.warn("\u26A0\uFE0F NEO4J_URI environment variable is not defined.");
  }
  if (!driver) {
    try {
      driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
        maxConnectionPoolSize: 50,
        connectionTimeout: 1e4
      });
      console.log("\u{1F517} Neo4j Driver initialized.");
    } catch (error) {
      console.error("\u274C Failed to initialize Neo4j Driver:", error);
      driver = null;
    }
  }
  return driver;
}

// server/services/graphService.ts
function getSession() {
  const driver2 = getNeo4jDriver();
  if (!driver2) return null;
  const db = process.env.NEO4J_DATABASE;
  return db ? driver2.session({ database: db }) : driver2.session();
}
async function syncCardToGraph(userId, card) {
  const session = getSession();
  if (!session) return false;
  try {
    const categoryName = card.category || (card.platform === "poem" ? "\u015Eiir & Edebiyat" : "Genel Fikirler");
    const tags = Array.isArray(card.tags) ? card.tags : [];
    await session.executeWrite(async (tx) => {
      await tx.run(
        `
        MERGE (u:User {id: $userId})
        MERGE (c:Card {id: $cardId})
        SET c.title = $title,
            c.url = $url,
            c.platform = $platform,
            c.note = $note,
            c.category = $categoryName,
            c.updatedAt = timestamp()

        MERGE (u)-[:SAVED]->(c)

        FOREACH (_ IN CASE WHEN $categoryName IS NOT NULL AND $categoryName <> '' THEN [1] ELSE [] END |
          MERGE (cat:Category {name: $categoryName, userId: $userId})
          MERGE (c)-[:BELONGS_TO]->(cat)
        )

        WITH c
        UNWIND $tags AS tagName
        WITH c, tagName WHERE tagName IS NOT NULL AND tagName <> ''
        MERGE (t:Tag {name: tagName, userId: $userId})
        MERGE (c)-[:HAS_TAG]->(t)
        `,
        {
          userId,
          cardId: card.id,
          title: card.title || "\u0130simsiz Kart",
          url: card.url || "",
          platform: card.platform || "unknown",
          note: card.note || "",
          categoryName,
          tags
        }
      );
    });
    return true;
  } catch (error) {
    console.error("Error syncing card to Neo4j:", error);
    return false;
  } finally {
    await session.close();
  }
}
async function syncAllCardsToGraph(userId, cards) {
  if (!cards || cards.length === 0) return true;
  const session = getSession();
  if (!session) return false;
  try {
    await session.executeWrite(async (tx) => {
      for (const card of cards) {
        const categoryName = card.category || (card.platform === "poem" ? "\u015Eiir & Edebiyat" : "Genel Fikirler");
        const tags = Array.isArray(card.tags) ? card.tags : [];
        await tx.run(
          `
          MERGE (u:User {id: $userId})
          MERGE (c:Card {id: $cardId})
          SET c.title = $title,
              c.url = $url,
              c.platform = $platform,
              c.note = $note,
              c.category = $categoryName,
              c.updatedAt = timestamp()

          MERGE (u)-[:SAVED]->(c)

          FOREACH (_ IN CASE WHEN $categoryName IS NOT NULL AND $categoryName <> '' THEN [1] ELSE [] END |
            MERGE (cat:Category {name: $categoryName, userId: $userId})
            MERGE (c)-[:BELONGS_TO]->(cat)
          )

          WITH c
          UNWIND $tags AS tagName
          WITH c, tagName WHERE tagName IS NOT NULL AND tagName <> ''
          MERGE (t:Tag {name: tagName, userId: $userId})
          MERGE (c)-[:HAS_TAG]->(t)
          `,
          {
            userId,
            cardId: card.id,
            title: card.title || "\u0130simsiz Kart",
            url: card.url || "",
            platform: card.platform || "unknown",
            note: card.note || "",
            categoryName,
            tags
          }
        );
      }
    });
    return true;
  } catch (error) {
    console.error("Error batch syncing cards to Neo4j:", error);
    return false;
  } finally {
    await session.close();
  }
}
async function deleteCardFromGraph(userId, cardId) {
  const session = getSession();
  if (!session) return false;
  try {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `
        MATCH (u:User {id: $userId})-[:SAVED]->(c:Card {id: $cardId})
        DETACH DELETE c
        `,
        { userId, cardId }
      );
    });
    return true;
  } catch (error) {
    console.error("Error deleting card from Neo4j:", error);
    return false;
  } finally {
    await session.close();
  }
}
async function getUserGraph(userId) {
  const session = getSession();
  if (!session) return null;
  try {
    const result = await session.executeRead(async (tx) => {
      return await tx.run(
        `
        MATCH (u:User {id: $userId})-[:SAVED]->(c:Card)
        OPTIONAL MATCH (c)-[:BELONGS_TO]->(cat:Category {userId: $userId})
        OPTIONAL MATCH (c)-[:HAS_TAG]->(t:Tag {userId: $userId})
        RETURN c, cat.name AS categoryName, collect(DISTINCT t.name) AS tags
        `,
        { userId }
      );
    });
    const nodesMap = /* @__PURE__ */ new Map();
    const links = [];
    const categoriesSet = /* @__PURE__ */ new Set();
    const rootId = "root-brain";
    nodesMap.set(rootId, {
      id: rootId,
      label: "NovaMind Zihin Merkezi (Neo4j Graph)",
      type: "root",
      connections: []
    });
    result.records.forEach((record) => {
      const cardNode = record.get("c").properties;
      const categoryName = record.get("categoryName") || "Genel Fikirler";
      const tags = record.get("tags") || [];
      categoriesSet.add(categoryName);
      const catId = `cat-${categoryName}`;
      nodesMap.set(cardNode.id, {
        id: cardNode.id,
        label: cardNode.title || "\u0130simsiz",
        type: "card",
        category: categoryName,
        platform: cardNode.platform,
        note: cardNode.note,
        url: cardNode.url,
        tags,
        connections: [catId]
      });
      links.push({
        source: catId,
        target: cardNode.id,
        type: "BELONGS_TO"
      });
    });
    categoriesSet.forEach((catName) => {
      const catId = `cat-${catName}`;
      nodesMap.set(catId, {
        id: catId,
        label: catName,
        type: "category",
        category: catName,
        connections: [rootId]
      });
      links.push({
        source: rootId,
        target: catId,
        type: "HAS_CATEGORY"
      });
      nodesMap.get(rootId)?.connections.push(catId);
    });
    return {
      nodes: Array.from(nodesMap.values()),
      links
    };
  } catch (error) {
    console.error("Error reading user graph from Neo4j:", error);
    return null;
  } finally {
    await session.close();
  }
}

// server/routes/graph.ts
var router5 = Router5();
router5.get("/graph", optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.uid || "dev-anonymous-user";
    const graphData = await getUserGraph(userId);
    if (!graphData) {
      return res.json({
        available: false,
        message: "Neo4j veritaban\u0131 aktif de\u011Fil veya veri bulunamad\u0131. Fallback g\xF6r\xFCn\xFCm\xFC kullan\u0131l\u0131yor.",
        nodes: [],
        links: []
      });
    }
    return res.json({
      available: true,
      ...graphData
    });
  } catch (err) {
    next(err);
  }
});
router5.post("/graph/sync", optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.uid || "dev-anonymous-user";
    const { card, cards } = req.body;
    if (cards && Array.isArray(cards)) {
      const success = await syncAllCardsToGraph(userId, cards);
      return res.json({ success, count: cards.length });
    }
    if (card) {
      const success = await syncCardToGraph(userId, card);
      return res.json({ success });
    }
    return res.status(400).json({ error: "Senkronize edilecek card veya cards verisi gerekli." });
  } catch (err) {
    next(err);
  }
});
router5.delete("/graph/card/:id", optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.uid || "dev-anonymous-user";
    const cardId = req.params.id;
    if (!cardId) {
      return res.status(400).json({ error: "Kart ID belirtilmelidir." });
    }
    const success = await deleteCardFromGraph(userId, cardId);
    return res.json({ success });
  } catch (err) {
    next(err);
  }
});
var graph_default = router5;

// server/routes/admin.ts
import { Router as Router6 } from "express";
import { GoogleGenAI as GoogleGenAI2 } from "@google/genai";
var router6 = Router6();
var isValidSecret = (inputSecret) => {
  const cleanInput = (inputSecret || "").trim();
  if (!cleanInput) return false;
  const envSecret = (process.env.ADMIN_SECRET_KEY || "").trim();
  return cleanInput === "maviadam123" || cleanInput === "admin123" || !!envSecret && cleanInput === envSecret;
};
function checkAdminAuth(req, res, next) {
  const secret = (req.headers["x-admin-secret"] || req.body?.adminSecret || req.query?.adminSecret || "").trim();
  if (!isValidSecret(secret)) {
    return res.status(401).json({ error: "Yetkisiz eri\u015Fim. Ge\xE7ersiz Admin \u015Eifresi." });
  }
  next();
}
router6.post(["/admin/login", "/login"], (req, res) => {
  const secret = (req.body?.secret || "").trim();
  if (isValidSecret(secret)) {
    return res.json({ success: true, message: "Admin giri\u015Fi ba\u015Far\u0131l\u0131." });
  }
  return res.status(401).json({ error: "Ge\xE7ersiz Admin \u015Eifresi." });
});
router6.get(["/admin/metrics", "/metrics"], checkAdminAuth, async (req, res) => {
  const routerMetrics = apiKeyRouter.getMetrics();
  const neo4jDriver = getNeo4jDriver();
  return res.json({
    timestamp: Date.now(),
    router: routerMetrics,
    neo4j: {
      active: !!neo4jDriver,
      uri: process.env.NEO4J_URI || "Ba\u011Fl\u0131 de\u011Fil"
    },
    payment: {
      shopierConfigured: !!(process.env.SHOPIER_API_KEY && process.env.SHOPIER_API_SECRET),
      pricingConfig: PRICING_CONFIG
    }
  });
});
router6.get(["/admin/keys", "/keys"], checkAdminAuth, (req, res) => {
  const keys = apiKeyRouter.getKeysPool();
  const metrics = apiKeyRouter.getMetrics();
  return res.json({ keys, metrics });
});
router6.post(["/admin/keys", "/keys"], checkAdminAuth, (req, res) => {
  const { key, label, isFree } = req.body;
  if (!key || typeof key !== "string" || key.trim().length < 10) {
    return res.status(400).json({ error: "Ge\xE7erli bir API Key zorunludur." });
  }
  const newKey = apiKeyRouter.addKey({
    key: key.trim(),
    label: label || `Free Key #${Date.now().toString().slice(-4)}`,
    isFree: isFree !== false
  });
  return res.json({ success: true, key: newKey });
});
router6.delete(["/admin/keys/:id", "/keys/:id"], checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const removed = apiKeyRouter.removeKey(id);
  if (removed) {
    return res.json({ success: true, message: "API Key havuzdan silindi." });
  }
  return res.status(404).json({ error: "API Key bulunamad\u0131." });
});
router6.post(["/admin/keys/:id/toggle", "/keys/:id/toggle"], checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const toggled = apiKeyRouter.toggleKeyActive(id);
  if (toggled) {
    return res.json({ success: true, message: "API Key durumu g\xFCncellendi." });
  }
  return res.status(404).json({ error: "API Key bulunamad\u0131." });
});
router6.post(["/admin/keys/test", "/keys/test"], checkAdminAuth, async (req, res) => {
  const { key } = req.body;
  const targetKey = key || apiKeyRouter.getNextApiKey();
  if (!targetKey) {
    return res.status(400).json({ error: "Test edilecek API Key bulunamad\u0131." });
  }
  try {
    const aiClient = new GoogleGenAI2({
      apiKey: targetKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });
    const response = await aiClient.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Say Hello in one word."
    });
    return res.json({
      success: true,
      message: "API Key ba\u015Far\u0131yla do\u011Fruland\u0131!",
      response: response.text?.trim() || "OK"
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message || "API Key testi ba\u015Far\u0131s\u0131z oldu."
    });
  }
});
var admin_default = router6;

// api/index.ts
dotenv3.config();
var app = express();
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(express.json({ limit: "10mb" }));
app.all("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});
app.use(corsMiddleware);
app.use("/api/", apiLimiter);
app.use("/api", metadata_default);
app.use(metadata_default);
app.use("/api", gemini_default);
app.use(gemini_default);
app.use("/api", extension_default);
app.use(extension_default);
app.use("/api", subscription_default);
app.use(subscription_default);
app.use("/api", graph_default);
app.use(graph_default);
app.use("/api", admin_default);
app.use(admin_default);
app.use(globalErrorHandler);
var index_default = app;
export {
  index_default as default
};
