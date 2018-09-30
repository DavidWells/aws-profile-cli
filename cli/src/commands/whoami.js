const { Command, flags } = require('@oclif/command')
const { replaceDefaultProfile, getProfiles } = require('aws-profile-utils')
const inquirer = require('inquirer')

class WhoAmICommand extends Command {
  async run() {
    const profiles = getProfiles()

    if (!profiles['default']) {
    	console.log('No default profile set.')
    }

    const currentProfile = Object.keys(profiles).filter((name) => {
    	// remove default
    	return name !== 'default'
    }).filter((profileName) => {
    	return areEqual(profiles[profileName], profiles['default'])
    })

    if (!currentProfile || !currentProfile.length) {
      console.log('No profile found matching your [default]')
      this.exit()
    }

    console.log('You are currently logged in as:')
	  console.log(`> ${currentProfile[0]}`)
  }
}

// Check if default === other profiles found
function areEqual(profile, secondProfile) {
  return profile.aws_access_key_id === secondProfile.aws_access_key_id &&
  profile.aws_secret_access_key === secondProfile.aws_secret_access_key
}

WhoAmICommand.description = `See your current profile name`

module.exports = WhoAmICommand
