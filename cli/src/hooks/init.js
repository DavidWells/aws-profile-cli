const SwitchCommand = require('../commands/switch')
const WhoAmICommand = require('../commands/whoami')

module.exports = async context => {
	// If no command passed in run switcher
	if (!context.id) {
		await WhoAmICommand.run()
		console.log()
 		await SwitchCommand.run()
 		process.exit()
	}
}