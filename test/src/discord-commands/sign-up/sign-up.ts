import { SlashCommandBuilder, CommandInteraction, DMChannel } from "discord.js";
import { discord } from "../../main";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("signup")
    .setDescription("Start signup process!"),
  async execute(interaction: CommandInteraction) {
    //Save guildId so we cans store in DB
    const guildId = interaction.guildId;
    const userId = interaction.user.id;
    const channelId = interaction.channelId;

    await interaction.reply("Starting setup! Check your PMs");
    const user = await discord.users.fetch(userId);

    if (user) {
      const userChannel = await user.createDM();
      try {
        userChannel.send(
          `Here is a debugger line for the testing!!! GuildID: ${guildId}, UserId: ${userId}, ChannelId: ${channelId}`
        );
      } catch (err) {
        console.log(err);
        userChannel.send("An error occured during sign up, please try again");
      }
    }
  },
};
