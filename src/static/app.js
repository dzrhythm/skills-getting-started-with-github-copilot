document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create activity title
        const titleEl = document.createElement("h4");
        titleEl.textContent = name;
        activityCard.appendChild(titleEl);

        // Description
        const descriptionEl = document.createElement("p");
        descriptionEl.textContent = details.description;
        activityCard.appendChild(descriptionEl);

        // Schedule
        const scheduleEl = document.createElement("p");
        const scheduleLabel = document.createElement("strong");
        scheduleLabel.textContent = "Schedule:";
        scheduleEl.appendChild(scheduleLabel);
        scheduleEl.appendChild(document.createTextNode(" " + details.schedule));
        activityCard.appendChild(scheduleEl);

        // Availability
        const availabilityEl = document.createElement("p");
        const availabilityLabel = document.createElement("strong");
        availabilityLabel.textContent = "Availability:";
        availabilityEl.appendChild(availabilityLabel);
        availabilityEl.appendChild(document.createTextNode(" " + spotsLeft + " spots left"));
        activityCard.appendChild(availabilityEl);

        // Participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsLabel = document.createElement("strong");
        participantsLabel.textContent = "Participants:";
        participantsSection.appendChild(participantsLabel);

        if (details.participants.length > 0) {
          const participantsUl = document.createElement("ul");
          participantsUl.className = "participants-list";

          details.participants.forEach(email => {
            const li = document.createElement("li");

            const emailSpan = document.createElement("span");
            emailSpan.className = "participant-email";
            emailSpan.textContent = email;
            li.appendChild(emailSpan);

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.dataset.activity = name;
            deleteButton.dataset.email = email;
            deleteButton.title = "Unregister participant";
            deleteButton.textContent = "🗑️";
            li.appendChild(deleteButton);

            participantsUl.appendChild(li);
          });

          participantsSection.appendChild(participantsUl);
        } else {
          const noParticipantsEl = document.createElement("p");
          noParticipantsEl.className = "no-participants";
          noParticipantsEl.textContent = "No participants yet. Be the first to sign up!";
          participantsSection.appendChild(noParticipantsEl);
        }

        activityCard.appendChild(participantsSection);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners for delete buttons
      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDeleteParticipant);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle participant deletion
  async function handleDeleteParticipant(event) {
    const button = event.currentTarget;
    const activity = button.dataset.activity;
    const email = button.dataset.email;

    if (!confirm(`Are you sure you want to unregister ${email} from ${activity}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        messageDiv.classList.remove("hidden");

        // Refresh activities list
        fetchActivities();

        // Hide message after 5 seconds
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 5000);
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
      }
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
