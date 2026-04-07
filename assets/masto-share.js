(function () {
  if (window.__mastoInit) {
    return;
  }

  window.__mastoInit = true;

  function getStorageKey(root) {
    return root?.getAttribute("data-masto-storage-key") || "mastoPreferredInstance";
  }

  function readSavedHost(root) {
    try {
      return localStorage.getItem(getStorageKey(root)) || "";
    } catch {
      return "";
    }
  }

  function writeSavedHost(root, host) {
    try {
      localStorage.setItem(getStorageKey(root), host);
    } catch {
      return false;
    }

    paintIndicators();
    return true;
  }

  function clearSavedHost(root) {
    try {
      localStorage.removeItem(getStorageKey(root));
    } catch {
      return false;
    }

    paintIndicators();
    return true;
  }

  function normalizeHost(input) {
    if (!input) {
      return "";
    }

    try {
      var url = new URL(input.includes("://") ? input : "https://" + input);
      return url.hostname.toLowerCase();
    } catch {
      return String(input)
        .trim()
        .replace(/^https?:\/\//i, "")
        .split("/")[0]
        .toLowerCase();
    }
  }

  function looksLikeHost(host) {
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host);
  }

  function buildShareUrl(host, query) {
    return "https://" + host + "/share" + (query || "");
  }

  function openShare(host, query) {
    var normalizedHost = normalizeHost(host);
    if (!normalizedHost) {
      return;
    }

    window.open(buildShareUrl(normalizedHost, query), "_blank", "noopener,noreferrer");
  }

  function getDetails(root) {
    return root?.querySelector(".masto-share__menu details") || null;
  }

  function closeMenu(root) {
    var details = getDetails(root);
    if (!details) {
      return;
    }

    details.open = false;

    var summary = details.querySelector("summary");
    if (summary) {
      summary.focus({ preventScroll: true });
    }
  }

  function announce(root, message) {
    var status = root?.querySelector("[data-masto-status]");
    if (!status) {
      return;
    }

    status.textContent = "";
    window.requestAnimationFrame(function () {
      status.textContent = message;
    });
  }

  function askForHost(defaultValue) {
    var input = window.prompt(
      "Enter your Mastodon instance host (for example: infosec.exchange)",
      defaultValue || ""
    );

    if (input == null) {
      return null;
    }

    var normalizedHost = normalizeHost(input);
    if (!normalizedHost) {
      return null;
    }

    if (!looksLikeHost(normalizedHost)) {
      window.alert("That does not look like a valid Mastodon instance host.");
      return null;
    }

    return normalizedHost;
  }

  function paintIndicators() {
    document.querySelectorAll(".masto-share").forEach(function (root) {
      var saved = readSavedHost(root);
      var fallback = root.getAttribute("data-masto-fallback") || "mastodon.social";
      var query = root.getAttribute("data-masto-query") || "";

      root.querySelectorAll("[data-masto-current]").forEach(function (label) {
        label.textContent = saved || "none";
      });

      root.querySelectorAll("[data-masto-action='use-saved']").forEach(function (button) {
        button.hidden = !saved;
        button.disabled = !saved;
      });

      root.querySelectorAll("[data-masto-action='clear-saved']").forEach(function (button) {
        button.hidden = !saved;
        button.disabled = !saved;
      });

      var primaryButton = root.querySelector("[data-masto-action='primary-share']");
      if (primaryButton) {
        primaryButton.href = buildShareUrl(saved || fallback, query);
      }
    });
  }

  document.addEventListener(
    "click",
    function (event) {
      var trigger = event.target.closest("[data-masto-action],[data-masto-host],[data-masto-save-host]");
      if (!trigger) {
        return;
      }

      var root = trigger.closest(".masto-share");
      if (!root) {
        return;
      }

      var query = root.getAttribute("data-masto-query") || "";
      var fallback = root.getAttribute("data-masto-fallback") || "mastodon.social";

      if (trigger.hasAttribute("data-masto-host")) {
        event.preventDefault();
        openShare(trigger.getAttribute("data-masto-host"), query);
        closeMenu(root);
        return;
      }

      if (trigger.hasAttribute("data-masto-save-host")) {
        event.preventDefault();
        var favoriteHost = normalizeHost(trigger.getAttribute("data-masto-save-host"));
        if (!favoriteHost) {
          return;
        }

        if (writeSavedHost(root, favoriteHost)) {
          announce(root, "Saved " + favoriteHost + " as your preferred instance.");
        }
        closeMenu(root);
        return;
      }

      var action = trigger.getAttribute("data-masto-action");

      if (action === "primary-share") {
        event.preventDefault();

        var currentHost = readSavedHost(root);
        if (currentHost) {
          openShare(currentHost, query);
        } else {
          var enteredHost = askForHost(fallback);
          if (!enteredHost) {
            return;
          }

          writeSavedHost(root, enteredHost);
          announce(root, "Saved " + enteredHost + " as your preferred instance.");
          openShare(enteredHost, query);
        }

        closeMenu(root);
        return;
      }

      if (action === "use-saved") {
        event.preventDefault();
        var savedHost = readSavedHost(root);
        if (!savedHost) {
          return;
        }

        openShare(savedHost, query);
        closeMenu(root);
        return;
      }

      if (action === "set-saved") {
        event.preventDefault();
        var manualHost = askForHost(readSavedHost(root) || fallback);
        if (!manualHost) {
          return;
        }

        writeSavedHost(root, manualHost);
        announce(root, "Saved " + manualHost + " as your preferred instance.");
        closeMenu(root);
        return;
      }

      if (action === "clear-saved") {
        event.preventDefault();
        if (clearSavedHost(root)) {
          announce(root, "Cleared your saved Mastodon instance.");
        }
        closeMenu(root);
      }
    },
    { capture: true }
  );

  document.addEventListener("click", function (event) {
    document.querySelectorAll(".masto-share .masto-share__menu details[open]").forEach(function (details) {
      if (!details.contains(event.target)) {
        details.open = false;
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
      return;
    }

    var openDetails = document.querySelector(".masto-share .masto-share__menu details[open]");
    if (!openDetails) {
      return;
    }

    openDetails.open = false;

    var summary = openDetails.querySelector("summary");
    if (summary) {
      summary.focus({ preventScroll: true });
    }
  });

  paintIndicators();
  document.addEventListener("DOMContentLoaded", paintIndicators);
})();
