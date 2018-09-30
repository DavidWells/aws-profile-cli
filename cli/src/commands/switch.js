const { Command, flags } = require('@oclif/command')
const { replaceDefaultProfile, getProfiles } = require('aws-profile-utils')
const inquirer = require('inquirer')

class SwitchCommand extends Command {
  async run() {
    const profiles = getProfiles()

    if (!profiles['default']) {
    	console.log('No default profile set.')
    }

    const profilesChoices = Object.keys(profiles).filter((name) => {
    	// remove default
    	return name !== 'default'
    }).map((profileName) => {
    	if (areEqual(profiles[profileName], profiles['default'])) {
        return `${profileName} (current default profile)`
      }
      return profileName
    })

	  const { accountToSwitchTo } = await inquirer.prompt([
	    {
	      type: 'list',
	      name: 'accountToSwitchTo',
	      message: 'Which profile do you want to switch to?',
	      choices: profilesChoices
	    }
	  ])

	  if (accountToSwitchTo) {
	  	replaceDefaultProfile(accountToSwitchTo.replace(' (current default profile)', ''))
	  }
  }
}

// Check if default === other profiles found
function areEqual(profile, secondProfile) {
  return profile.aws_access_key_id === secondProfile.aws_access_key_id &&
  profile.aws_secret_access_key === secondProfile.aws_secret_access_key
}

SwitchCommand.description = `Switch AWS profiles`

module.exports = SwitchCommand
