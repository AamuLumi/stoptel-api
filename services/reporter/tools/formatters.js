const NOT_A_NUMBER_REGEX = /[^0-9]+/gim;

module.exports = {
	formatPhoneNumber: (number) => {
		let n = String(number).replace(NOT_A_NUMBER_REGEX, '');

		if (n.startsWith('33')) {
			n = n.substring(2);

			if (n.length === 9) {
				n = `0${n}`;
			} else if (n.length !== 10) {
				return null;
			}
		} else if (n.startsWith('0')) {
			if (n.length !== 10) {
				return null;
			}
		} else {
			return null;
		}

		return n;
	},
};
