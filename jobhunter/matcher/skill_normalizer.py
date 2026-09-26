SKILL_ALIASES = {
    "python": {
        "python",
        "python3",
    },

    "fastapi": {
        "fastapi",
        "fast api",
    },

    "rest_api": {
        "rest api",
        "rest apis",
        "rest_api",
        "restful api",
        "restful apis",
    },

    "sql": {
        "sql",
        "mysql",
        "postgresql",
        "postgres",
    },

    "mongodb": {
        "mongodb",
        "mongo db",
        "mongo",
    },

    "javascript": {
        "javascript",
        "js",
    },

    "typescript": {
        "typescript",
        "ts",
    },

    "react": {
        "react",
        "react.js",
        "reactjs",
    },

    "nextjs": {
        "next.js",
        "nextjs",
        "next js",
    },

    "git": {
        "git",
        "github",
    },

    "docker": {
        "docker",
        "docker container",
        "docker containers",
    },
}


def normalize_skill(skill: str) -> str:
    skill = skill.lower().strip()

    for canonical, aliases in SKILL_ALIASES.items():
        if skill in aliases:
            return canonical

    return skill