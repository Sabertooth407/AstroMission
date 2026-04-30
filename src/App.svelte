<!---->
<script>
  import Home from "./routes/Home.svelte";
  import Signup from "./routes/Signup.svelte";
  import Game from "./routes/Game.svelte";

  let page = "home";

  function goSignup() {
    page = "signup";
  }

  function startGame() {
    page = "game";
  }

  function endGame() {
    page = "home";
    localStorage.removeItem("team");
  }
</script>


{#if page === "home"}
  <Home on:play={goSignup} />

{:else if page === "signup"}
  <Signup on:start={startGame} />

{:else if page === "game"}
  <Game on:end={endGame} />
{/if}
