
import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* =================================
   1. SUPABASE CONFIGURATION
================================= */



const SUPABASE_URL = "https://ohkvknhqbknocrytirbp.supabase.co";
const SUPABASE_KEY = "sb_publishable_E_TagxG-byimvX81ZsEGOw_F-gUyL45";
const ADMIN_USER_ID = "a0dca848-6e1e-4aae-8a02-20285c697ba8";

const configured =
    !SUPABASE_URL.includes("YOUR_") &&
    !SUPABASE_KEY.includes("YOUR_") &&
    !ADMIN_USER_ID.includes("YOUR_");

const supabase = configured
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

/* =================================
   2. HTML ELEMENTS
================================= */

const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const statusMessage = document.getElementById("statusMessage");

const logoutButton = document.getElementById("logoutButton");
const menuButton = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");
const pageTitle = document.getElementById("pageTitle");

const blogForm = document.getElementById("blogForm");
const blogId = document.getElementById("blogId");
const blogTitle = document.getElementById("blogTitle");
const blogImage = document.getElementById("blogImage");
const blogDescription = document.getElementById("blogDescription");
const blogContent = document.getElementById("blogContent");
const blogFormTitle = document.getElementById("blogFormTitle");
const blogsList = document.getElementById("blogsList");
const cancelBlogEdit = document.getElementById("cancelBlogEdit");

const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");

const pageNames = {
    overview: "Overview",
    blogs: "Blogs",
    projects: "Projects",
    skills: "Skills",
    messages: "Messages"
};

document.getElementById("year").textContent =
    new Date().getFullYear();

/* =================================
   3. STATUS MESSAGES
================================= */

function showLoginMessage(message, isError = true) {
    loginMessage.textContent = message;
    loginMessage.classList.toggle("error", isError);
    loginMessage.classList.remove("hidden");
}

function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle("error", isError);
    statusMessage.classList.remove("hidden");

    window.setTimeout(() => {
        statusMessage.classList.add("hidden");
    }, 5000);
}

/* =================================
   4. LOGIN AND SESSION
================================= */

function showDashboard() {
    loginScreen.classList.add("hidden");
    dashboard.classList.remove("hidden");
}

function showLogin() {
    dashboard.classList.add("hidden");
    loginScreen.classList.remove("hidden");
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!configured) {
        showLoginMessage(
            "Supabase is not configured yet. Complete the setup first."
        );
        return;
    }

    const email = loginForm.elements.email.value.trim();
    const password = loginForm.elements.password.value;

    const submitButton = loginForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Signing in...";

    try {
        const { data, error } =
            await supabase.auth.signInWithPassword({
                email,
                password
            });

        if (error) throw error;

        if (data.user.id !== ADMIN_USER_ID) {
            await supabase.auth.signOut();

            showLoginMessage(
                "Access denied. This account is not the authorized admin."
            );

            return;
        }

        showDashboard();
        showLoginMessage("Login successful.", false);
        await loadDashboardData();

    } catch (error) {
        showLoginMessage(
            error.message || "Login failed. Please try again."
        );
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Login";
    }
});

/* =================================
   5. CHECK EXISTING SESSION
================================= */

async function checkSession() {
    if (!configured) {
        showLogin();
        showLoginMessage(
            "Add your Supabase settings to enable admin login."
        );
        return;
    }

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
        showLogin();
        return;
    }

    if (data.session.user.id !== ADMIN_USER_ID) {
        await supabase.auth.signOut();
        showLogin();
        showLoginMessage("Access denied.");
        return;
    }

    showDashboard();
    await loadDashboardData();
}

logoutButton.addEventListener("click", async () => {
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
        showStatus(error.message, true);
        return;
    }

    showLogin();
    loginForm.reset();
    showLoginMessage("You have signed out.", false);
});

/* =================================
   6. DASHBOARD NAVIGATION
================================= */

function openPage(pageName) {
    if (!pageNames[pageName]) return;

    pages.forEach((page) => {
        page.classList.toggle(
            "hidden",
            page.id !== `page-${pageName}`
        );
    });

    navLinks.forEach((link) => {
        link.classList.toggle(
            "active",
            link.dataset.page === pageName
        );
    });

    pageTitle.textContent = pageNames[pageName];
    sidebar.classList.remove("open");
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        openPage(link.dataset.page);
    });
});

document.querySelectorAll("[data-open-page]").forEach((button) => {
    button.addEventListener("click", () => {
        openPage(button.dataset.openPage);
    });
});

menuButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

/* =================================
   7. LOAD DASHBOARD DATA
================================= */

async function loadDashboardData() {
    await Promise.all([
        loadBlogs(),
        loadProjects(),
        loadSkills(),
        loadMessages()
    ]);
}

/* =================================
   8. LOAD BLOGS
================================= */

async function loadBlogs() {
    const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        showStatus("Could not load blogs: " + error.message, true);
        return;
    }

    document.getElementById("blogCount").textContent =
        data.length;

    blogsList.replaceChildren();

    if (data.length === 0) {
        blogsList.textContent = "No blogs yet. Create your first blog.";
        return;
    }

    data.forEach((blog) => {
        const item = document.createElement("article");
        item.className = "blog-item";

        const heading = document.createElement("h3");
        heading.textContent = blog.title;

        const description = document.createElement("p");
        description.textContent = blog.description || "";

        const status = document.createElement("span");
        status.className = "item-status";
        status.textContent = blog.published
            ? "Published"
            : "Draft";

        const actions = document.createElement("div");
        actions.className = "item-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-outline";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            blogId.value = blog.id;
            blogTitle.value = blog.title || "";
            blogImage.value = blog.image_url || "";
            blogDescription.value = blog.description || "";
            blogContent.value = blog.content || "";

            blogFormTitle.textContent = "Edit Blog";
            cancelBlogEdit.classList.remove("hidden");

            openPage("blogs");
            blogForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", async () => {
            if (!window.confirm(
                `Delete "${blog.title}"? This cannot be undone.`
            )) return;

            const { error: deleteError } = await supabase
                .from("blogs")
                .delete()
                .eq("id", blog.id);

            if (deleteError) {
                showStatus(deleteError.message, true);
                return;
            }

            showStatus("Blog deleted successfully.");
            await loadBlogs();
        });

        actions.append(editButton, deleteButton);
        item.append(status, heading, description, actions);
        blogsList.append(item);
    });
}

/* =================================
   9. CREATE AND UPDATE BLOGS
================================= */

blogForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = blogTitle.value.trim();
    const imageUrl = blogImage.value.trim();
    const description = blogDescription.value.trim();
    const content = blogContent.value.trim();

    if (!title || !description || !content) {
        showStatus("Please complete all required blog fields.", true);
        return;
    }

    if (imageUrl) {
        try {
            const url = new URL(imageUrl);

            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error("Invalid URL protocol");
            }
        } catch {
            showStatus("Please enter a valid image URL.", true);
            return;
        }
    }

    const saveButton = blogForm.querySelector(
        'button[type="submit"]'
    );

    saveButton.disabled = true;

    const blogData = {
        title,
        image_url: imageUrl || null,
        description,
        content,
        published: true
    };

    try {
        let error;

        if (blogId.value) {
            ({ error } = await supabase
                .from("blogs")
                .update(blogData)
                .eq("id", blogId.value));
        } else {
            ({ error } = await supabase
                .from("blogs")
                .insert(blogData));
        }

        if (error) throw error;

        showStatus(
            blogId.value
                ? "Blog updated successfully."
                : "Blog published successfully."
        );

        resetBlogForm();
        await loadBlogs();

    } catch (error) {
        showStatus(
            "Could not save blog: " + error.message,
            true
        );
    } finally {
        saveButton.disabled = false;
    }
});

function resetBlogForm() {
    blogForm.reset();
    blogId.value = "";
    blogFormTitle.textContent = "Create Blog";
    cancelBlogEdit.classList.add("hidden");
}

cancelBlogEdit.addEventListener("click", resetBlogForm);

/* =================================
   10. OTHER DASHBOARD SECTIONS
================================= */

async function loadProjects() {
    
    const list = document.getElementById("projectsList");

    const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        list.textContent = "Projects could not be loaded: " + error.message;
        return;
    }

    document.getElementById("projectCount").textContent =
        data.length;

    list.replaceChildren();

    if (!data.length) {
        list.textContent = "No projects have been added yet.";
        return;
    }

    data.forEach((project) => {
        const item = document.createElement("article");
        item.className = "project-item";

        const heading = document.createElement("h3");
        heading.textContent = project.title;

        const description = document.createElement("p");
        description.textContent = project.description || "";

        const actions = document.createElement("div");
        actions.className = "item-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-outline";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            document.getElementById("projectId").value = project.id;
            document.getElementById("projectTitle").value =
                project.title || "";
            document.getElementById("projectDescription").value =
                project.description || "";
            document.getElementById("projectImage").value =
                project.image_url || "";
            document.getElementById("projectUrl").value =
                project.project_url || "";

            document.getElementById("projectForm").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", async () => {
            if (!window.confirm(
                `Delete "${project.title}"? This cannot be undone.`
            )) return;

            const { error: deleteError } = await supabase
                .from("projects")
                .delete()
                .eq("id", project.id);

            if (deleteError) {
                showStatus(
                    "Could not delete project: " + deleteError.message,
                    true
                );
                return;
            }

            showStatus("Project deleted successfully.");
            await loadProjects();
        });

        actions.append(editButton, deleteButton);
        item.append(heading, description, actions);
        list.append(item);
    });
}



const projectForm = document.getElementById("projectForm");

projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const projectId = document.getElementById("projectId").value;
    const title = document.getElementById("projectTitle").value.trim();
    const description = document.getElementById("projectDescription").value.trim();
    const imageUrl = document.getElementById("projectImage").value.trim();
    const projectUrl = document.getElementById("projectUrl").value.trim();

    if (!title || !description) {
        showStatus("Please enter the project title and description.", true);
        return;
    }

    const projectData = {
        title,
        description,
        image_url: imageUrl || null,
        project_url: projectUrl || null
    };

    const saveButton = projectForm.querySelector('button[type="submit"]');
    saveButton.disabled = true;

    try {
        let error;

        if (projectId) {
            ({ error } = await supabase
                .from("projects")
                .update(projectData)
                .eq("id", projectId));
        } else {
            ({ error } = await supabase
                .from("projects")
                .insert([projectData]));
        }

        if (error) throw error;

        showStatus(
            projectId
                ? "Project updated successfully!"
                : "Project added successfully!"
        );

        projectForm.reset();
        document.getElementById("projectId").value = "";
        document.getElementById("cancelProjectEdit").classList.add("hidden");

        await loadProjects();

    } catch (error) {
        showStatus("Could not save project: " + error.message, true);
    } finally {
        saveButton.disabled = false;
    }
});

document.getElementById("cancelProjectEdit").addEventListener("click", () => {
    projectForm.reset();
    document.getElementById("projectId").value = "";
    document.getElementById("cancelProjectEdit").classList.add("hidden");
});



const skillForm = document.getElementById("skillForm");

skillForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const skillId = document.getElementById("skillId");
    const name = document.getElementById("skillName").value.trim();
    const level = document.getElementById("skillLevel").value.trim();

    if (!name) {
        showStatus("Please enter a skill name.", true);
        return;
    }

    const skillData = { name, level };

    try {
        let error;

        if (skillId && skillId.value) {
            ({ error } = await supabase
                .from("skills")
                .update(skillData)
                .eq("id", skillId.value));
        } else {
            ({ error } = await supabase
                .from("skills")
                .insert([skillData]));
        }

        if (error) throw error;

        showStatus(
            skillId && skillId.value
                ? "Skill updated successfully!"
                : "Skill added successfully!"
        );

        skillForm.reset();

        if (skillId) skillId.value = "";

        await loadSkills();

    } catch (error) {
        showStatus("Could not save skill: " + error.message, true);
    }
});



async function loadSkills() {
    const list = document.getElementById("skillsList");

    const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        list.textContent = "Skills could not be loaded: " + error.message;
        return;
    }

    document.getElementById("skillCount").textContent = data.length;
    list.replaceChildren();

    if (!data.length) {
        list.textContent = "No skills have been added yet.";
        return;
    }

    data.forEach((skill) => {
        const item = document.createElement("article");
        item.className = "skill-item";

        const heading = document.createElement("h3");
        heading.textContent = skill.name;

        const description = document.createElement("p");
        description.textContent = skill.level || "";

        const actions = document.createElement("div");
        actions.className = "item-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-outline";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            document.getElementById("skillName").value = skill.name || "";
            document.getElementById("skillLevel").value = skill.level || "";

            let skillId = document.getElementById("skillId");

            if (!skillId) {
                skillId = document.createElement("input");
                skillId.type = "hidden";
                skillId.id = "skillId";
                skillForm.appendChild(skillId);
            }

            skillId.value = skill.id;

            showStatus("Skill selected for editing. Change its details and save.");
            skillForm.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", async () => {
            if (!window.confirm(`Delete "${skill.name}"?`)) return;

            const { error: deleteError } = await supabase
                .from("skills")
                .delete()
                .eq("id", skill.id);

            if (deleteError) {
                showStatus("Could not delete skill: " + deleteError.message, true);
                return;
            }

            showStatus("Skill deleted successfully!");
            await loadSkills();
        });

        actions.append(editButton, deleteButton);
        item.append(heading, description, actions);
        list.append(item);
    });
}


async function loadMessages() {
    const list = document.getElementById("messagesList");

    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        list.textContent = "Messages could not be loaded.";
        return;
    }

    list.replaceChildren();

    if (!data.length) {
        list.textContent = "You have no messages yet.";
        return;
    }

    data.forEach((message) => {
        const item = document.createElement("article");
        item.className = "message-item";

        const heading = document.createElement("h3");
        heading.textContent =
            `${message.name || "Visitor"} — ${message.email || ""}`;

        const time = document.createElement("p");
        time.textContent = message.created_at
            ? "Received: " + new Date(message.created_at).toLocaleString()
            : "Time unavailable";

        const content = document.createElement("p");
        content.textContent = message.content || "";

        item.append(heading, time, content);
        list.append(item);
    });
}




openPage("overview");
checkSession();