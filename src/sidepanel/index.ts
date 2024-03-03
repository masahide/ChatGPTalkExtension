import "../app.css";
import Sidepanel from "../components/Sidepanel.svelte";

const target = document.getElementById("app");

async function render() {
  if (target) {
    new Sidepanel({ target });
  }
}

document.addEventListener("DOMContentLoaded", render);
