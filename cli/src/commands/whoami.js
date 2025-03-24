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

    if (process.env.AWS_PROFILE) {
      console.log(`\nShell Session AWS_PROFILE environment variable set to:`)
      console.log(`> ${process.env.AWS_PROFILE}`)
    }

    if (process.env.AWS_PROFILE && process.env.AWS_PROFILE !== currentProfile[0]) {
      console.log()
      console.log(`Warning: AWS_PROFILE env var "${process.env.AWS_PROFILE}" is different from your current profile "${currentProfile[0]}". This can cause unexpected aws cli behavior.`)
      console.log('\nTo fix this, run:')
      console.log('\nunset AWS_PROFILE\n')
    }
  }
}

// Check if default === other profiles found
function areEqual(profile, secondProfile) {
  return profile.aws_access_key_id === secondProfile.aws_access_key_id &&
  profile.aws_secret_access_key === secondProfile.aws_secret_access_key
}

WhoAmICommand.description = `See your current profile name`

module.exports = WhoAmICommand
