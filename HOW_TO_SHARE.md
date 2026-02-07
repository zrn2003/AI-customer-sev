# How to Share This Project

Follow these steps to share the project with updated Docker support.

## 1. Clean Up (Important!)
Before zipping, **DELETE** these massive folders to make the file small enough to send:

*   [ ] `frontend/node_modules` (Folder) - **DELETE THIS** (It is huge and auto-generated)
*   [ ] `server/venv` (Folder) - **DELETE THIS** (It is your local python setup)
*   [ ] `server/__pycache__` (Folder) - **DELETE THIS**
*   [ ] `frontend/dist` (Folder, if exists) - Delete this.
*   [ ] `.git` (Hidden Folder) - Optional, delete if you don't want to share edit history.

## 2. Decide on Secrets (.env)
*   **Trust the person?** -> Keep `server/.env`. It has your API keys.
*   **Don't trust them?** -> Delete `server/.env`. They will need to create their own using `README_DOCKER.md`.

## 3. Zip It
1.  Go to the parent folder `E:\Final YR project`.
2.  Right-click the `AI-customer-sev` folder.
3.  Select **Send to** -> **Compressed (zipped) folder**.
4.  Name it `SupportFlow_Project.zip`.

## 4. Send It
Send the `SupportFlow_Project.zip` file via Email, Drive, or WhatsApp.

## 5. What the Receiver Doing?
They just need to:
1.  Unzip it.
2.  Install Docker.
3.  Run `docker-compose up`.
