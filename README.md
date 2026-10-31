# commercial-return-dashboard

Glocomp commercial team performance, ROI and contribution visibility prototype. It has role-based views (Director → Senior Manager → Manager → Employee), explainable KPI scores, configurable financial/non-financial weightage, ROI on the full cost base, AI-assisted KPI setting with manager approval, and an HR intervention workflow.

- **Guide, architecture, reliability plan and demo script:** [GLOCOMP.md](GLOCOMP.md)
- **Security approach and limitations:** [SECURITY.md](SECURITY.md)
- **Demo guide (every page, methodology, architecture diagram, demo script):** [Glocomp Demo Guide](https://claude.ai/artifact/AnCheWRxegQHoxo1NV8uWN)
- **Target database with row-level security:** [supabase/schema.sql](supabase/schema.sql)

## Run locally
```bash
python dev_server.py
```
Open http://localhost:8000 and use the local demo codes `director-demo`, `senior-demo`, `manager-demo`, `employee-demo` (one per role level).

## Test
```bash
python -m unittest discover -s tests -v
```

## Deploy (Vercel)
Import the repo; no build step is needed. Set the environment variables `SESSION_SECRET` (long random string) and the four role codes `DEMO_CODE_DIRECTOR`, `DEMO_CODE_SENIOR_MANAGER`, `DEMO_CODE_MANAGER`, `DEMO_CODE_EMPLOYEE`. Without them, sign-in is refused.

## Data
All data is anonymised or dummy. Names are fictional. HR context comes from the synthetic dataset (`data/source/hr_dummy_dataset.xlsx`, not committed — source: https://link.kabel.my/hqwRT4). Rebuild the server-side seed with `pip install openpyxl` and `python scripts/build_seed.py`.
