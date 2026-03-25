# Movement Analytics — task backlog

## Done (baseline UI)

- [x] Premium landing (`/`) aligned with sports-tech direction  
- [x] Upload page (`/analyze/squat`) with filming guidance  
- [x] `POST /api/analyze` — multipart video, returns `analysisId`  
- [x] Processing route (`/analyze/squat/processing/[analysisId]`) — short delay → results  
- [x] Results page (`/results/[id]`) — loads persisted analysis by `id`  
- [x] Invalid id → `not-found` on results and processing  
- [x] Squat-specific types in `lib/analysis/types.ts`  

## Next

- [ ] Supabase storage + persist `analysisId` + metadata  
- [ ] Real CV / inference pipeline improvements (accuracy, latency, robustness)  
- [ ] Optional `GET /api/analyze/[id]` when analyses live in DB  

## Later / out of scope (do not start without explicit go-ahead)

- Supabase auth (until history is a requirement)  
- Multi-movement or multi-sport abstractions  
- Basketball shooting, in-game analytics, drill recommendations, S&C prescriptions  

## Parking lot

- [ ] Processing time estimates and retry copy  
- [ ] Rate limiting / abuse protection on `/api/analyze` when public  
