async function sleep(t) {
    return await new Promise(resolve => setTimeout(resolve, t));
}

async function randomSleep(min, max) {
    const delay = min + Math.random() * (max - min);
    await new Promise(resolve => setTimeout(resolve, delay));
}