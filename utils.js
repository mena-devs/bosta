function buildHelp(meta) {
    const examples = meta.examples.map(e => `    example: ${e}`).join('\n');
    return `${meta.name} - ${meta.short}\n${examples}`;
}

function pre(text) {
    return `\`\`\`${text}\`\`\``;
}

module.exports = {
    buildHelp,
    pre,
};
