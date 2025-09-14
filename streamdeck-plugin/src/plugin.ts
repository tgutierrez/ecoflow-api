import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { EcoPowerAction } from "./actions/eco-power-action";

// Enable trace logging for debugging
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register the EcoFlow power action
streamDeck.actions.registerAction(new EcoPowerAction());

// Connect to the Stream Deck
streamDeck.connect();