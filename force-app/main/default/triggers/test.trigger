trigger test on Account (after update) {
    System.debug(trigger.oldMap);
}