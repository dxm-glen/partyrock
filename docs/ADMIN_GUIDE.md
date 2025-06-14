# Admin Guide - Korean Language Learning Platform

## Overview
This guide covers all administrative functions for managing tutorial content, user access, and system settings.

## Admin Authentication

### Login Process
1. Navigate to the admin tab
2. Click "관리자" in the main navigation
3. Enter admin password: `16!^109a`
4. Access granted to all admin functions

### Password Management
- Change password via "관리자 비밀번호 변경" button
- Minimum 6 characters required
- Password persists during session only
- Restart required for permanent changes

## Tutorial Management

### Viewing Tutorial Information
The tutorial management section displays:
- **Title**: Korean tutorial name
- **Description**: Detailed content description
- **Video URL**: Direct S3 bucket link
- **Thumbnail URL**: Preview image location
- **Subtitle URL**: VTT/SRT caption file link
- **Category**: Content classification (가입 및 로그인 안내, 위젯 및 제작 실습, etc.)
- **Difficulty**: 초급, 중급, 고급
- **Duration**: Runtime in minutes and seconds
- **Views**: Total view count
- **Status**: 공개 (public) or 비공개 (private)

### Adding New Tutorials
1. Use "튜토리얼 등록" form in admin panel
2. Required fields:
   - Title (영상 제목)
   - Description (설명)
   - Video URL (AWS S3 link)
   - Category selection
   - Difficulty level
   - Duration in seconds
3. Optional fields:
   - Thumbnail URL
   - Subtitle URL
4. Click "업로드 및 발행" to publish

### Editing Existing Tutorials
1. Click "수정" button on any tutorial
2. Edit modal opens with all current values
3. Modify any field as needed
4. Click "저장" to apply changes
5. Changes reflect immediately on public site

### Publication Control
- **Public Tutorials**: Visible to all users
- **Private Tutorials**: Hidden from public view
- Toggle status with "공개로 변경" / "비공개로 변경" buttons
- Private content remains in database for future publication

### Deleting Tutorials
1. Click "삭제" button on unwanted tutorial
2. Confirm deletion in popup dialog
3. Tutorial permanently removed from database
4. Action cannot be undone

## S3 Asset Management

### Video URLs
Format: `https://partyrock-guide-nxtcloud.s3.ap-northeast-2.amazonaws.com/filename.mp4`

### Current Video Assets
- `signup-guide.mp4` - AWS PartyRock 가입 및 로그인 가이드
- `practice.mp4` - 위젯 제작 실습
- `demo.mp4` - 데모 확인
- `hands-on.mp4` - AI 여행 비서앱 핸즈온 실습

### Thumbnail Management
- Optional preview images for videos
- Supports JPG, PNG formats
- Same S3 bucket structure as videos

### Subtitle Support
- VTT and SRT formats supported
- Korean language captions recommended
- Upload to same S3 bucket for consistency

## Security Features

### Content Protection
- Right-click blocking on video players
- Keyboard shortcut prevention (F12, Ctrl+S, Ctrl+U)
- Download prevention mechanisms
- CSS-based text selection blocking

### Admin Access Control
- Password-protected admin functions
- Session-based authentication
- API key validation for all operations
- Secure header-based authentication

## Best Practices

### Content Organization
1. Use consistent naming conventions for S3 files
2. Include descriptive titles in Korean
3. Set appropriate difficulty levels
4. Add comprehensive descriptions
5. Test video playback before publishing

### Regular Maintenance
- Monitor view counts for popular content
- Update outdated tutorials as needed
- Maintain consistent video quality
- Backup critical content regularly

### User Experience
- Keep tutorial titles concise but descriptive
- Use progressive difficulty levels
- Ensure video quality is consistent
- Provide clear learning objectives

## Troubleshooting

### Admin Access Issues
- Verify correct password entry
- Check browser console for errors
- Clear browser cache if needed
- Restart application if authentication fails

### Video Playback Problems
- Confirm S3 URL accessibility
- Check video file format compatibility
- Verify CORS settings on S3 bucket
- Test with different browsers

### Upload Failures
- Validate all required fields completed
- Check S3 URL format correctness
- Ensure admin authentication is active
- Review browser network tab for errors

## API Endpoints Reference

### Admin Authentication
- `POST /api/auth/admin` - Login verification
- `POST /api/auth/admin/change-password` - Update credentials

### Tutorial Management
- `GET /api/admin/tutorials` - Fetch all tutorials (including private)
- `POST /api/tutorials` - Create new tutorial
- `PATCH /api/tutorials/:id` - Update existing tutorial
- `DELETE /api/tutorials/:id` - Remove tutorial

### Public Access
- `GET /api/tutorials` - Fetch published tutorials only
- `GET /api/tutorials/:id` - View specific tutorial with analytics

---
*Last updated: June 14, 2025*